let itemData = [];
let filteredData = [];
let currentPage = 1;
let itemsPerPage = 20;

document.getElementById('itemsPerPage').addEventListener('change', (event) => {
    itemsPerPage = parseInt(event.target.value);
    currentPage = 1;
    updateTable();
});

document.getElementById('prevPage').addEventListener('click', () => changePage('prev'));
document.getElementById('nextPage').addEventListener('click', () => changePage('next'));

// Load the Excel file
fetch('questsdb.xlsx') // Cambia esta ruta por tu archivo .xlsx
    .then(response => response.arrayBuffer())
    .then(data => {
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        itemData = XLSX.utils.sheet_to_json(worksheet);
        filteredData = itemData; // Inicializamos filteredData con todos los datos
        populateTypeFilter();
        updateTable();
    });

// Update the table with paginated data
function updateTable() {
    const tableBody = document.querySelector('#itemTable tbody');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    tableBody.innerHTML = '';

    filteredData.slice(startIndex, endIndex).forEach(item => {
        const row = document.createElement('tr');
        
        // Mostrar solo las columnas específicas: Quest Name, Level, Category, Type
        ['Quest Name', 'Level', 'Category', 'Type'].forEach(column => {
            const cell = document.createElement('td');
            cell.textContent = item[column] || '';  // Asegúrate de que no falle si falta algún valor
            row.appendChild(cell);
        });

        tableBody.appendChild(row);
    });

    document.getElementById('currentPage').textContent = `Page ${currentPage} of ${Math.ceil(filteredData.length / itemsPerPage)}`;
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = endIndex >= filteredData.length;
}

// Change the page
function changePage(direction) {
    if (direction === 'prev' && currentPage > 1) {
        currentPage--;
    } else if (direction === 'next' && currentPage < Math.ceil(filteredData.length / itemsPerPage)) {
        currentPage++;
    }
    updateTable();
}

// Populate the type filter dynamically
function populateTypeFilter() {
    const typeFilter = document.getElementById('typeFilter');
    const types = new Set();

    itemData.forEach(item => {
        const typeValue = item['Type']; // Cambiado 'type' a 'Type' (tal como en el XLSX)
        if (typeValue) {
            types.add(typeValue);
        }
    });

    types.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        typeFilter.appendChild(option);
    });
}

// Apply filters
function applyFilters() {
    const searchValue = document.getElementById('searchInput').value.toLowerCase();
    const selectedType = document.getElementById('typeFilter').value;

    // Filtramos los datos según el input y el tipo seleccionado
    filteredData = itemData.filter(item => {
        const matchesSearch = Object.values(item).some(value =>
            value.toString().toLowerCase().includes(searchValue)
        );
        const matchesType = selectedType === '' || item['Type'] === selectedType; // Reemplaza 'Type' con el nombre correcto de la columna
        return matchesSearch && matchesType;
    });

    currentPage = 1; // Reinicia la página actual a 1 después de aplicar filtros
    updateTable(); // Actualiza la tabla con los datos filtrados
}

document.getElementById('searchInput').addEventListener('input', applyFilters);
document.getElementById('typeFilter').addEventListener('change', applyFilters);
