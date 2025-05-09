// Seleciona elementos do DOM
const contador = document.getElementById('contador');
const btnIncrementar = document.getElementById('incrementar');
const btnResetar = document.getElementById('resetar');

let valor = 0;

// Função para atualizar o contador
function atualizarContador() {
  contador.textContent = valor;
}

// Eventos
btnIncrementar.addEventListener('click', () => {
  valor++;
  atualizarContador();
});

btnResetar.addEventListener('click', () => {
  valor = 0;
  atualizarContador();
});
