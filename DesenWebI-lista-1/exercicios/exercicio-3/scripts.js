document.getElementById("imageForm").addEventListener("submit", function (e) {
    e.preventDefault();
    
    const width = document.getElementById("width").value;
    const height = document.getElementById("height").value;
    const quantity = document.getElementById("quantity").value;
    const errorMessage = document.getElementById("errorMessage");
  
    errorMessage.textContent = ""; // Limpa mensagens de erro anteriores
    
    // Validação dos campos
    if (width < 100 || width > 1920 || height < 100 || height > 1080) {
      errorMessage.textContent = "Insira valores válidos para largura e altura!";
      return;
    }
  
    const gallery = document.getElementById("gallery");
    gallery.innerHTML = ""; // Limpa galeria antes de gerar novas imagens
    
    for (let i = 0; i < quantity; i++) {
      const seed = Math.random().toString(36).substring(2, 15); // Gera uma seed única
      const imageUrl = `https://picsum.photos/seed/${seed}/${width}/${height}`;
      
      const imageContainer = document.createElement("div");
      const img = document.createElement("img");
      img.src = imageUrl;
      img.alt = `Imagem aleatória ${i + 1}`;
      img.tabIndex = 0; // Foco visível para acessibilidade
      
      const actions = document.createElement("div");
      actions.classList.add("actions");
  
      // Botão de download
      const downloadLink = document.createElement("a");
      // Garante que o link de download tenha o mesmo seed, mas em Full HD (1920x1080)
      downloadLink.href = `https://picsum.photos/seed/${seed}/1920/1080.webp`;
      downloadLink.download = "image.webp";
      downloadLink.textContent = "Baixar em Full HD";
      actions.appendChild(downloadLink);
  
      // Botão de copiar link
      const copyLink = document.createElement("a");
      copyLink.href = "#";
      copyLink.textContent = "Copiar link";
      copyLink.addEventListener("click", function (e) {
        e.preventDefault();
        navigator.clipboard.writeText(imageUrl).then(() => {
          alert("Link copiado!");
        });
      });
      actions.appendChild(copyLink);
  
      // Botão de compartilhamento
      const shareLink = document.createElement("a");
      shareLink.href = `https://api.whatsapp.com/send?text=Veja esta imagem: ${encodeURIComponent(imageUrl)}`;
      shareLink.target = "_blank";
      shareLink.textContent = "Compartilhar";
      actions.appendChild(shareLink);
  
      // Inserir imagem e ações na galeria
      imageContainer.appendChild(img);
      imageContainer.appendChild(actions);
      gallery.appendChild(imageContainer);
    }
  });
  