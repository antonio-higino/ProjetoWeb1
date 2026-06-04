// =========================
// Persistência
// =========================

const CACHE_KEY = "pokemonCache";
const TEAM_KEY = "pokemonTeam";
const TYPE_CACHE_KEY = "pokemonTypeCache";

const typeCache =
    JSON.parse(
        localStorage.getItem(TYPE_CACHE_KEY)
    ) || {};

const expectedTypes = [
    "normal",
    "fire",
    "water",
    "electric",
    "grass",
    "ice",
    "fighting",
    "poison",
    "ground",
    "flying",
    "psychic",
    "bug",
    "rock",
    "ghost",
    "dragon",
    "dark",
    "steel",
    "fairy"
];

// Carrega cache salvo
const persistedCache =
    JSON.parse(localStorage.getItem(CACHE_KEY)) || {};

// Converte objeto para Map
const pokemonCache = new Map(
    Object.entries(persistedCache)
);

// Carrega time salvo
const team =
    JSON.parse(localStorage.getItem(TEAM_KEY)) || [];

// =========================
// Elementos HTML
// =========================

const pokemonInput =
    document.getElementById("pokemonInput");

const addPokemonButton =
    document.getElementById("addPokemonButton");

// =========================
// Inicialização
// =========================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await initializeTypeCache();

        renderTeam();

        renderOverview();

        addPokemonButton.addEventListener(
            "click",
            addPokemonToTeam
        );
    }
);

// =========================
// Funções de Persistência
// =========================

function saveCache() {
    const cacheObject =
        Object.fromEntries(pokemonCache);

    localStorage.setItem(
        CACHE_KEY,
        JSON.stringify(cacheObject)
    );
}

function saveTeam() {
    localStorage.setItem(
        TEAM_KEY,
        JSON.stringify(team)
    );
}

async function initializeTypeCache() {

    const hasAllTypes =
        expectedTypes.every(
            type => typeCache[type]
        );

    if (hasAllTypes) {
        return;
    }

    try {

        const requests = [];

        for (let i = 1; i <= 18; i++) {

            requests.push(
                fetch(
                    `https://pokeapi.co/api/v2/type/${i}`
                ).then(res => res.json())
            );
        }

        const types =
            await Promise.all(requests);

        types.forEach(type => {

            typeCache[type.name] = type;
        });

        localStorage.setItem(
            TYPE_CACHE_KEY,
            JSON.stringify(typeCache)
        );

    } catch (error) {

        console.error(
            "Erro ao carregar tipos:",
            error
        );
    }
}

// =========================
// Adicionar Pokémon
// =========================

async function addPokemonToTeam() {

    const pokemonName =
        pokemonInput.value
            .trim()
            .toLowerCase();

    if (!pokemonName) {
        alert("Digite o nome de um Pokémon.");
        return;
    }

    if (team.length >= 6) {
        alert("Seu time já possui 6 Pokémon.");
        return;
    }

    try {

        let pokemonData;

        // Verifica cache
        if (pokemonCache.has(pokemonName)) {

            console.log(
                `Cache HIT: ${pokemonName}`
            );

            pokemonData =
                pokemonCache.get(pokemonName);

        } else {

            console.log(
                `Cache MISS: ${pokemonName}`
            );

            const response = await fetch(
                `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
            );

            if (!response.ok) {
                throw new Error(
                    "Pokémon não encontrado."
                );
            }

            pokemonData =
                await response.json();

            // Salva no cache
            pokemonCache.set(
                pokemonName,
                pokemonData
            );

            saveCache();
        }

        // Evita duplicados
        const alreadyExists = team.some(
            pokemon => pokemon.id === pokemonData.id
        );

        if (alreadyExists) {
            alert(
                "Esse Pokémon já está no time."
            );
            return;
        }

        // Adiciona ao time
        team.push(pokemonData);

        saveTeam();

        renderTeam();

        renderOverview();

        pokemonInput.value = "";

    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "Erro ao buscar Pokémon."
        );
    }
}

// =========================
// Renderização
// =========================

function renderTeam() {

    const teamContainer =
        document.getElementById("team");

    teamContainer.innerHTML = "";

    team.forEach((pokemon, index) => {

        const card =
            document.createElement("div");

        card.className = "pokemon-card";

        const sprite =
            pokemon.sprites?.front_default ||
            "";

        const types =
            pokemon.types
                .map(type => type.type.name)
                .join(", ");

        card.innerHTML = `
            <div class="pokemon-image">
                <img
                    src="${sprite}"
                    alt="${pokemon.name}"
                >
            </div>

            <div class="pokemon-info">
                <h3>
                    ${pokemon.name.toUpperCase()}
                </h3>

                <p>
                    Nº ${pokemon.id}
                </p>

                <p>
                    Tipo(s): ${types}
                </p>
            </div>

            <button
                class="remove-button"
                onclick="removePokemon(${index})"
            >
                Remover
            </button>
        `;

        teamContainer.appendChild(card);
    });
}

// =========================
// Remoção
// =========================

function removePokemon(index) {

    team.splice(index, 1);

    saveTeam();

    renderTeam();

    renderOverview();
}

function getPokemonTypeMultipliers(pokemon) {

    const multipliers = {};

    Object.keys(typeCache)
        .forEach(type => {

            multipliers[type] = 1;
        });

    pokemon.types.forEach(slot => {

        const pokemonType =
            slot.type.name;

        const typeData =
            typeCache[pokemonType];

        if (!typeData) return;

        typeData.damage_relations
            .double_damage_from
            .forEach(type => {

                multipliers[type.name] *= 2;
            });

        typeData.damage_relations
            .half_damage_from
            .forEach(type => {

                multipliers[type.name] *= 0.5;
            });

        typeData.damage_relations
            .no_damage_from
            .forEach(type => {

                multipliers[type.name] *= 0;
            });
    });

    return multipliers;
}

function calculateCoverageMatrix() {

    const matrix = {};

    Object.keys(typeCache)
        .forEach(type => {

            matrix[type] = {
                immune: 0,
                veryResistant: 0,
                resistant: 0,
                neutral: 0,
                weak: 0,
                veryWeak: 0
            };
        });

    team.forEach(pokemon => {

        const multipliers = getPokemonTypeMultipliers(pokemon);

        Object.entries(multipliers).forEach(
            ([attackType, multiplier]) => {

                if (multiplier === 0) {
                    matrix[attackType]
                        .immune++;

                } else if (multiplier <= 0.25) {
                    matrix[attackType]
                        .veryResistant++;

                } else if (multiplier === 0.5) {
                    matrix[attackType]
                        .resistant++;

                } else if (multiplier === 1) {
                    matrix[attackType]
                        .neutral++;

                } else if (multiplier === 2) {
                    matrix[attackType]
                        .weak++;

                } else if (multiplier >= 4) {
                    matrix[attackType]
                        .veryWeak++;

                } else {
                    matrix[attackType]
                        .neutral++;
                }
            }
        );
    });

    return matrix;
}

function calculateCoverageScore(coverage) {

    return (
        coverage.immune * 2 +
        coverage.veryResistant * 1.5 +
        coverage.resistant * 1 -
        coverage.weak * 1 -
        coverage.veryWeak * 1.5
    );
}

function getTeamWeaknesses() {

    const matrix =
        calculateCoverageMatrix();

    return Object.entries(matrix)

        .filter(
            ([_, coverage]) =>
                (coverage.veryWeak * 2 + coverage.weak) > (coverage.immune + coverage.veryResistant + coverage.resistant)
        )

        .sort(
            (a, b) => (b[1].veryWeak * 4 + b[1].weak * 2) - (a[1].veryWeak * 4 + a[1].weak * 2)
        );
}

function renderOverview() {

    const overview = document.getElementById("overview");

    overview.innerHTML = "";

    const matrix = calculateCoverageMatrix();

    Object.entries(matrix)
        .sort((a, b) => {
            return (calculateCoverageScore(b[1]) - calculateCoverageScore(a[1]));
        })

        .forEach(
            ([type, coverage]) => {

                const score = calculateCoverageScore(coverage);

                const card = document.createElement("div");

                card.className = "type-overview-card";

                card.innerHTML = `
                    <h3>${type.toUpperCase()}</h3>

                    <p>Score: ${score}</p>

                    <hr>

                    <p>Imunes: ${coverage.immune}</p>

                    <p>Muito Resistentes: ${coverage.veryResistant}</p>

                    <p>Resistentes: ${coverage.resistant}</p>

                    <p>Neutros: ${coverage.neutral}</p>

                    <p>Fracos: ${coverage.weak}</p>

                    <p>Muito Fracos: ${coverage.veryWeak}</p>
                `;

                overview.appendChild(card);
            }
        );
}
