document.addEventListener('DOMContentLoaded', function() {
    const capturePhotoBtn = document.getElementById('capture-photo');
    const uploadPhotoBtn = document.getElementById('upload-photo');
    const fileInput = document.getElementById('file-input');
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const photo = document.getElementById('photo');
    const getLocationBtn = document.getElementById('get-location');
    const manualLocationBtn = document.getElementById('manual-location');
    const latitudeInput = document.getElementById('latitude');
    const longitudeInput = document.getElementById('longitude');
    const saveLocationBtn = document.getElementById('save-location');
    const map = document.getElementById('map');
    const titleInput = document.getElementById('title');
    const descriptionInput = document.getElementById('description');
    const savePhotoBtn = document.getElementById('save-photo');
    const galleryTableBody = document.querySelector('#gallery-table tbody');
    const detailsModal = document.getElementById('details-modal');
    const closeModal = document.getElementById('close-modal');
    const modalPhoto = document.getElementById('modal-photo');
    const modalMap = document.getElementById('map');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');

    let modalMapInstance = null; // Variável para armazenar a instância do mapa da modal
    
    function openDetailsModal(photoId) {
        const photos = JSON.parse(localStorage.getItem('photos')) || [];
        const photoData = photos.find(photo => photo.id == photoId);

        if (photoData) {
            // Preenche os detalhes da modal
            modalTitle.textContent = photoData.title;
            modalDescription.textContent = photoData.description || 'Sem descrição';
            modalPhoto.src = photoData.photoUrl;

            // Limpa o conteúdo anterior do contêiner do mapa
            document.getElementById('map').innerHTML = ""; // IMPORTANTE: limpa o contêiner do mapa

            // Recria o mapa dentro da modal
            modalMapInstance = L.map(modalMap).setView([photoData.latitude, photoData.longitude], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(modalMapInstance);
            L.marker([photoData.latitude, photoData.longitude]).addTo(modalMapInstance);

            // Mostra a modal
            detailsModal.style.display = 'block';
        }
    }

    // Fechar a modal ao clicar no botão de fechar
    closeModal.addEventListener('click', function() {
        // Remove a instância do mapa para evitar conflitos ao reabrir
        if (modalMapInstance) {
            modalMapInstance.remove(); // Remove o mapa atual
            modalMapInstance = null; // Limpa a variável para permitir recriação do mapa
        }

        // Fecha a modal
        detailsModal.style.display = 'none';
    });

    // Initialize map
    const mapInstance = L.map(map).setView([0, 0], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstance);

    function setupCamera() {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                video.srcObject = stream;
            })
            .catch(err => console.error('Erro ao acessar a câmera:', err));
    }

    function takePhoto() {
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        photo.src = canvas.toDataURL('image/png');
        photo.style.display = 'block';
        video.style.display = 'none';
        canvas.style.display = 'none';
    }

    function handleFileUpload(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            photo.src = e.target.result;
            photo.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                latitudeInput.value = lat;
                longitudeInput.value = lon;
                showMap(lat, lon);
                latitudeInput.style.display = 'block';
                longitudeInput.style.display = 'block';
                saveLocationBtn.style.display = 'block';
            });
        } else {
            alert('Geolocalização não é suportada por este navegador.');
        }
    }

    function showMap(lat, lon) {
        mapInstance.setView([lat, lon], 13);
        L.marker([lat, lon]).addTo(mapInstance);
    }

    function savePhoto() {
        const title = titleInput.value;
        const description = descriptionInput.value;
        const latitude = latitudeInput.value;
        const longitude = longitudeInput.value;
        const date = new Date().toISOString();
        const id = Date.now();

        if (!title) {
            alert('Título é obrigatório.');
            return;
        }

        const photoData = {
            id,
            title,
            description,
            latitude,
            longitude,
            date,
            photoUrl: photo.src
        };

        let photos = JSON.parse(localStorage.getItem('photos')) || [];
        photos.push(photoData);
        localStorage.setItem('photos', JSON.stringify(photos));
        displayPhotos();
        clearForm();
    }

    function clearForm() {
        titleInput.value = '';
        descriptionInput.value = '';
        latitudeInput.value = '';
        longitudeInput.value = '';
        photo.src = '';
        photo.style.display = 'none';
        video.style.display = 'block';
        canvas.style.display = 'block';
        latitudeInput.style.display = 'none';
        longitudeInput.style.display = 'none';
        saveLocationBtn.style.display = 'none';
    }

    function displayPhotos() {
        galleryTableBody.innerHTML = '';
        const photos = JSON.parse(localStorage.getItem('photos')) || [];

        photos.forEach(photo => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${photo.id}</td>
                <td>${photo.title}</td>
                <td>${photo.description || ''}</td>
                <td><a href="#" data-id="${photo.id}" class="view-details">Ver Detalhes</a></td>
                <td>${photo.date}</td>
                <td><button data-id="${photo.id}" class="delete-photo">Excluir</button></td>
            `;
            galleryTableBody.appendChild(row);
        });

        // Adiciona evento aos links "Ver Detalhes"
        document.querySelectorAll('.view-details').forEach(link => {
            link.addEventListener('click', event => {
                event.preventDefault();
                const photoId = event.target.getAttribute('data-id');
                openDetailsModal(photoId);
            });
        });

        // Adiciona evento aos botões de "Excluir"
        document.querySelectorAll('.delete-photo').forEach(button => {
            button.addEventListener('click', event => {
                const photoId = event.target.getAttribute('data-id');
                deletePhoto(photoId);
            });
        });
    }

    function openDetailsModal(photoId) {
        const photos = JSON.parse(localStorage.getItem('photos')) || [];
        const photoData = photos.find(photo => photo.id == photoId);

        if (photoData) {
            // Preenche os detalhes da modal
            modalTitle.textContent = photoData.title;
            modalDescription.textContent = photoData.description || 'Sem descrição';
            modalPhoto.src = photoData.photoUrl;

            // Configura o mapa para mostrar a localização
            const lat = photoData.latitude;
            const lon = photoData.longitude;

            const modalMapInstance = L.map(modalMap).setView([lat, lon], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(modalMapInstance);
            L.marker([lat, lon]).addTo(modalMapInstance);

            // Mostra a modal
            detailsModal.style.display = 'block';
        }
    }

    function deletePhoto(photoId) {
        let photos = JSON.parse(localStorage.getItem('photos')) || [];
        photos = photos.filter(photo => photo.id != photoId);
        localStorage.setItem('photos', JSON.stringify(photos));
        displayPhotos();
    }

    // Fechar a modal ao clicar no botão de fechar
    closeModal.addEventListener('click', function() {
        detailsModal.style.display = 'none';
    });

    // Configurar os eventos para capturar foto ou fazer upload
    capturePhotoBtn.addEventListener('click', setupCamera);
    uploadPhotoBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileUpload);
    getLocationBtn.addEventListener('click', getLocation);
    savePhotoBtn.addEventListener('click', savePhoto);

    // Inicializar a exibição de fotos salvas
    displayPhotos();
});
