document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('pokemon-search');
    const searchButton = document.getElementById('search-button');
    const pokemonInfo = document.getElementById('pokemon-info');
    const pokemonName = document.getElementById('pokemon-name');
    const pokemonSpecies = document.getElementById('pokemon-species');
    const pokemonSprite = document.getElementById('pokemon-sprite');
    const pokemonBackSprite = document.getElementById('pokemon-back-sprite');
    const pokemonColor = document.getElementById('pokemon-color');
    const pokemonWeight = document.getElementById('pokemon-weight');
    const normalAbilities = document.getElementById('normal-abilities');
    const specialAbilities = document.getElementById('special-abilities');
    const pokemonCry = document.getElementById('pokemon-cry');
    const playCryButton = document.getElementById('play-cry');
    const loader = document.getElementById('loader');
    const errorMessage = document.getElementById('error-message');

    // Endpoint da API GraphQL da PokéAPI
    const API_URL = 'https://graphqlpokemon.favware.tech/v8';

    // Função para buscar dados do Pokémon
    async function fetchPokemonData(pokemonName) {
        // Mostrar loader e esconder mensagens de erro
        loader.style.display = 'block';
        errorMessage.style.display = 'none';
        pokemonInfo.style.display = 'none';

        try {
            // Consulta GraphQL
            const query = `
                query GetPokemon($pokemon: PokemonEnum!) {
                    getPokemon(pokemon: $pokemon) {
                        num
                        species
                        color
                        baseSpecies
                        sprite
                        backSprite
                        weight
                        abilities {
                            first {
                                name
                            }
                            second {
                                name
                            }
                            hidden {
                                name
                            }
                            special {
                                name
                            }
                        }
                        cry
                    }
                }
            `;

            // Variáveis para a consulta
            const variables = {
                pokemon: pokemonName.toLowerCase()
            };

            // Realizar requisição POST
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query,
                    variables
                })
            });

            const data = await response.json();

            // Verificar se há erros na resposta
            if (data.errors) {
                throw new Error(data.errors[0].message);
            }

            // Verificar se os dados do Pokémon foram encontrados
            if (!data.data || !data.data.getPokemon) {
                throw new Error('Pokémon não encontrado');
            }

            return data.data.getPokemon;
        } catch (error) {
            console.error('Erro ao buscar dados do Pokémon:', error);
            errorMessage.textContent = `Erro: ${error.message || 'Não foi possível completar a busca'}`;
            errorMessage.style.display = 'block';
            return null;
        } finally {
            loader.style.display = 'none';
        }
    }

    // Função para exibir os dados do Pokémon na interface
    function displayPokemonData(pokemon) {
        if (!pokemon) return;

        // Nome e espécie
        pokemonName.textContent = pokemon.species;
        pokemonSpecies.textContent = pokemon.baseSpecies ? `(${pokemon.baseSpecies})` : '';

        // Sprites
        pokemonSprite.src = pokemon.sprite;
        pokemonBackSprite.src = pokemon.backSprite || '';
        pokemonBackSprite.style.display = pokemon.backSprite ? 'block' : 'none';

        // Cor e peso
        pokemonColor.textContent = pokemon.color || 'Desconhecido';
        pokemonWeight.textContent = pokemon.weight ? `${pokemon.weight} kg` : 'Desconhecido';

        // Habilidades normais
        normalAbilities.innerHTML = '';
        if (pokemon.abilities.first) {
            const li = document.createElement('li');
            li.textContent = pokemon.abilities.first.name;
            normalAbilities.appendChild(li);
        }
        
        if (pokemon.abilities.second) {
            const li = document.createElement('li');
            li.textContent = pokemon.abilities.second.name;
            normalAbilities.appendChild(li);
        }
        
        if (pokemon.abilities.hidden) {
            const li = document.createElement('li');
            li.textContent = `${pokemon.abilities.hidden.name} (Oculta)`;
            normalAbilities.appendChild(li);
        }
        
        // Habilidades especiais
        specialAbilities.innerHTML = '';
        if (pokemon.abilities.special && pokemon.abilities.special.length > 0) {
            pokemon.abilities.special.forEach(ability => {
                const li = document.createElement('li');
                li.textContent = ability.name;
                specialAbilities.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = 'Nenhuma habilidade especial';
            specialAbilities.appendChild(li);
        }

        // Configurar audio do grito do Pokémon
        if (pokemon.cry) {
            pokemonCry.src = pokemon.cry;
            playCryButton.disabled = false;
        } else {
            pokemonCry.src = '';
            playCryButton.disabled = true;
        }

        // Mostrar seção de informações
        pokemonInfo.style.display = 'block';
    }

    // Evento de clique no botão de busca
    searchButton.addEventListener('click', async () => {
        const searchValue = searchInput.value.trim();
        if (searchValue) {
            const pokemonData = await fetchPokemonData(searchValue);
            if (pokemonData) {
                displayPokemonData(pokemonData);
            }
        }
    });

    // Evento de pressionar Enter no campo de busca
    searchInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            const searchValue = searchInput.value.trim();
            if (searchValue) {
                const pokemonData = await fetchPokemonData(searchValue);
                if (pokemonData) {
                    displayPokemonData(pokemonData);
                }
            }
        }
    });

    // Evento de clique no botão de reproduzir grito
    playCryButton.addEventListener('click', () => {
        if (pokemonCry.src) {
            pokemonCry.style.display = 'block';
            pokemonCry.play();
        }
    });
});