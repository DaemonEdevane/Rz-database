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
fetch('monsterdb.xlsx') // Cambia esta ruta por tu archivo .xlsx
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

window.onload = function() {
    const canvas = document.getElementById('canvasLogo');
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.src = 'Data/interface/icon/logo.png';  // Ruta de tu imagen

    img.onload = function() {
        // Establecer el tamaño del canvas para que coincida con el tamaño de la imagen
        canvas.width = img.width;
        canvas.height = img.height;

        // Dibuja la imagen en el canvas cuando esté cargada
        drawImageOnCanvas(img);

        // Luego aplicar el efecto de brillo
        applyShine();
    };

    // Función para dibujar la imagen en el canvas
    function drawImageOnCanvas(image) {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el canvas
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);  // Dibuja la imagen en el canvas
    }

    // Función para aplicar el brillo dorado encima de la imagen
    function applyShine() {
        let offset = canvas.width;  // Comienza el brillo desde fuera del canvas por la derecha

        function draw() {
            // Redibuja la imagen sobre el canvas para mantenerla visible
            drawImageOnCanvas(img);

            // Crear un gradiente de brillo dorado (estilo oro) más estrecho
            const shineWidth = 150;  // Puedes cambiar este valor para hacer el brillo más pequeño o más grande
            const gradient = ctx.createLinearGradient(offset, 0, offset - shineWidth, 0);
            gradient.addColorStop(0, 'rgba(255, 215, 0, 0)');    // Transparente
            gradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.8)');  // Brillo dorado
            gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');    // Transparente

            // Crear un nuevo canvas de máscara para aplicar solo donde la imagen es visible
            const maskCanvas = document.createElement('canvas');
            const maskCtx = maskCanvas.getContext('2d');
            maskCanvas.width = canvas.width;
            maskCanvas.height = canvas.height;

            // Dibuja la imagen sobre el maskCanvas
            maskCtx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Extraemos la imagen como una máscara, donde lo blanco (opaco) permitirá ver el brillo
            maskCtx.globalCompositeOperation = 'destination-in';  // Mantener la parte visible de la imagen
            maskCtx.fillStyle = 'white';  // Definir lo que queremos mantener (la parte opaca de la imagen)
            maskCtx.fillRect(0, 0, canvas.width, canvas.height);

            // Aplicar el brillo sobre la imagen usando la máscara
            ctx.globalCompositeOperation = 'source-over';  // Asegurarnos de que no se sobrescriba el brillo
            ctx.drawImage(maskCanvas, 0, 0);  // Aplica la máscara sobre la imagen

            // Usar el gradiente como una capa de brillo sobre la imagen
            ctx.globalCompositeOperation = 'source-atop';  // Usamos 'source-atop' para que el brillo solo afecte las áreas visibles de la imagen
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Restaurar el comportamiento normal de dibujo después de aplicar el brillo
            ctx.globalCompositeOperation = 'source-over';

            // Mover el brillo hacia la izquierda con la velocidad ajustada
            offset -= 17;  // Velocidad de 17 como pediste

            // Cuando el brillo haya pasado por completo, reiniciar su posición
            if (offset < -canvas.width) {
                offset = canvas.width;
            }

            // Llamar a la función recursivamente para mantener el brillo en movimiento
            requestAnimationFrame(draw);
        }

        // Iniciar la animación de brillo
        draw();
    }
}
