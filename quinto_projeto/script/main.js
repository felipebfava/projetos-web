
// Seleciona todos os botões de confirmar compra
const confirmButtons = document.querySelectorAll('.carrinho-info button');

// Adiciona o evento de clique a cada botão
confirmButtons.forEach(button => {
    button.addEventListener('click', () => {
        alert("Compra confirmada! Obrigado por comprar na TecInfo.");
    });
});
