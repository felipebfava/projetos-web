
window.sr = ScrollReveal({ reset: true});

sr.reveal('.area-1', { duration: 1000}); /*duração de 1000 milissegundos, que é igual a 1 segundo*/

sr.reveal('.area-2', {
    rotate: { x: 0, y: 80, z: 0},
    duration: 2000
});
/*rotate para mudar como o elemento aparece, x mexe na vertical e y na horizontal*/

sr.reveal('.area-3', {
    rotate: { x: 100, y: 100, z: 0},
    duration: 2000
});
