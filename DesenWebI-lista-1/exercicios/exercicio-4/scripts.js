document.addEventListener('DOMContentLoaded', function() {
    const capturePhotoBtn = document.getElementById('capture-photo');
    const uploadPhotoBtn = document.getElementById('upload-photo');
    const fileInput = document.getElementById('file-input');
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const photo = document.getElementById('photo');  // Foto capturada
    const getLocationBtn = document.getElementById('get-location');
    const manualLocationBtn = document.getElementById('manual-location');
    const latitudeInput = document.getElementById('latitude');
    const longitudeInput = document.getElementById('longitude');
    const saveLocationBtn = document.getElementById('save-location');
    const titleInput = document.getElementById('title');
    const descriptionInput = document.getElementById('description');
    const savePhotoBtn = document.getElementById('save-photo');
    const galleryTableBody = document.querySelector('#gallery-table tbody');
    const detailsModal = document.getElementById('details-modal');
    const closeModal = document.getElementById('close-modal');
    const modalPhoto = document.getElementById('modal-photo');
    const modalMap = document.getElementById('modal-map');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');

    let currentLat = null;
    let currentLon = null;
    let mapInstance = null;

    let videoStream = null; // Armazena o stream de vídeo para ser fechado depois

    // Função para inicializar a câmera
    function setupCamera() {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                video.srcObject = stream; // Armazena o stream de vídeo
                video.style.display = 'block';  // Exibe o vídeo imediatamente
                photo.style.display = 'none';   // Esconde a foto capturada até que seja tirada
            })
            .catch(err => console.error('Erro ao acessar a câmera:', err));
    }

    // Função para tirar foto e exibir abaixo da câmera
    function takePhoto() {
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        photo.src = canvas.toDataURL('image/png');
        photo.style.display = 'block';      // Exibe a foto capturada abaixo da câmera
        video.style.display = 'block';      // Mantém o feed de vídeo ativo
        canvas.style.display = 'none';      // Esconde o canvas após capturar a foto
    }

    // Função para lidar com o upload de foto
    function handleFileUpload(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            photo.src = e.target.result;
            photo.style.display = 'block';  // Exibe a foto carregada
            video.style.display = 'none';   // Esconde o vídeo ao carregar uma foto
        };
        reader.readAsDataURL(file);
    }

    // Função para obter a localização atual
    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                currentLat = position.coords.latitude;
                currentLon = position.coords.longitude;
                latitudeInput.value = currentLat;
                longitudeInput.value = currentLon;
                latitudeInput.style.display = 'block';
                longitudeInput.style.display = 'block';
                saveLocationBtn.style.display = 'block';
            });
        } else {
            alert('Geolocalização não é suportada por este navegador.');
        }
    }

    // Função para salvar a foto e a localização
    function savePhoto() {
        const title = titleInput.value;
        const description = descriptionInput.value;
        const latitude = currentLat || latitudeInput.value;
        const longitude = currentLon || longitudeInput.value;
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

    // Função para limpar o formulário
    function clearForm() {
        titleInput.value = '';
        descriptionInput.value = '';
        latitudeInput.value = '';
        longitudeInput.value = '';
        photo.src = '';
        photo.style.display = 'none';
        video.style.display = 'block';  // Mantenha o vídeo ativo
        latitudeInput.style.display = 'none';
        longitudeInput.style.display = 'none';
        saveLocationBtn.style.display = 'none';
        currentLat = null;
        currentLon = null;
    }

    // Função para exibir as fotos salvas
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

    // Função para abrir o modal com os detalhes da foto e o mapa de localização
    function openDetailsModal(photoId) {
        const photos = JSON.parse(localStorage.getItem('photos')) || [];
        const photoData = photos.find(photo => photo.id == photoId);

        if (photoData) {
            // Preenche os detalhes da modal
            modalTitle.textContent = photoData.title;
            modalDescription.textContent = photoData.description || 'Sem descrição';
            modalPhoto.src = photoData.photoUrl;

            // Limpa o conteúdo anterior do mapa
            modalMap.innerHTML = '';

            // Inicializa o mapa no modal
            if (mapInstance) {
                mapInstance.remove(); // Remove o mapa anterior se existir
            }

            mapInstance = L.map(modalMap).setView([photoData.latitude, photoData.longitude], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapInstance);
            L.marker([photoData.latitude, photoData.longitude]).addTo(mapInstance);

            // Atualiza o tamanho do mapa para remover áreas cinzas
            setTimeout(() => {
                mapInstance.invalidateSize(); // Corrige a renderização do mapa
            }, 300);

            // Mostra o modal
            detailsModal.style.display = 'block';
        }
    }

    // Função para deletar uma foto
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

    // Função para fechar a modal ao clicar fora do conteúdo do modal
    window.addEventListener('click', function(event) {
        if (event.target === detailsModal) {
            detailsModal.style.display = 'none';
        }
    });

    // Adicionar eventos para os botões
    capturePhotoBtn.addEventListener('click', setupCamera);  // Inicia a câmera ao clicar
    capturePhotoBtn.addEventListener('click', takePhoto);     // Captura a foto ao clicar novamente
    uploadPhotoBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileUpload);
    getLocationBtn.addEventListener('click', getLocation);
    savePhotoBtn.addEventListener('click', savePhoto);

    // Inicializar a exibição de fotos salvas
    displayPhotos();
});
