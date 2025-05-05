
//A PokeAPI só possui métodos GET

// Função para buscar dados de um Pokémon por nome
function getPokemon(nome) {
    fetch(`https://pokeapi.co/api/v2/pokemon/${nome}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(`Nome: ${data.name}`);
            console.log(`Altura: ${data.height}`);
            console.log(`Peso: ${data.weight}`);
            console.log(`Tipos: ${data.types.map(t => t.type.name).join(', ')}`);
        })
        .catch(error => {
            console.error('Erro ao buscar Pokémon:', error.message);
        });
}

// Exemplo de uso:
for (let i = 1; i <= 3; i++) {
    getPokemon(i);
}

getPokemon('pikachu');
