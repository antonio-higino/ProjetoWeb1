// =========================
// Persistência
// =========================

const CACHE_KEY = "pokemonCache";
const TEAM_KEY = "pokemonTeam";
const TYPE_CACHE_KEY = "pokemonTypeCache";
const SPECIES_CACHE_KEY = "pokemonSpeciesCache";

const EXCLUDED_FORMS = [
    "-mega",
    "-mega-x",
    "-mega-y",
    "-gmax",
    "-totem"
];

const TYPE_COLORS = {

    bug: "#A8B820",
    dark: "#6F5747",
    dragon: "#7036FC",
    electric: "#F9D130",
    fairy: "#FD67D7",
    fighting: "#C02F27",
    fire: "#F17F2E",
    flying: "#A990F1",
    ghost: "#715799",
    grass: "#78C850",
    ground: "#E1C067",
    ice: "#95D7D8",
    normal: "#A9A878",
    poison: "#A03FA1",
    psychic: "#F95788",
    rock: "#B89F38",
    steel: "#B8B8D0",
    water: "#6890F0"
};

let speciesCache = {};

try {

    const storedSpeciesCache =
        localStorage.getItem(
            SPECIES_CACHE_KEY
        );

    speciesCache =
        storedSpeciesCache
            ? JSON.parse(
                storedSpeciesCache
            )
            : {};

} catch {

    speciesCache = {};
}

function saveSpeciesCache() {

    try {

        localStorage.setItem(
            SPECIES_CACHE_KEY,
            JSON.stringify(
                speciesCache
            )
        );

    } catch {

        console.warn(
            "Não foi possível salvar speciesCache."
        );
    }
}

function compressPokemonData(
    pokemon
) {

    return {

        id: pokemon.id,

        name: pokemon.name,

        species: pokemon.species,

        stats: pokemon.stats,

        bst:
            calculateBST(
                pokemon
            ),

        types: pokemon.types,

        sprites: {

            front_default:
                pokemon.sprites.front_default
        }
    };
}

let typeCache = {};

try {

    const storedTypes =
        localStorage.getItem(
            TYPE_CACHE_KEY
        );

    typeCache =
        storedTypes
            ? JSON.parse(storedTypes)
            : {};

} catch (error) {

    console.warn(
        "Cache de tipos inválido. Limpando..."
    );

    localStorage.removeItem(
        TYPE_CACHE_KEY
    );

    typeCache = {};
}

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

const pokemonCache =
    new Map();

// Carrega time salvo
let team = [];

team.forEach(
    pokemon => {

        pokemonCache.set(
            pokemon.name,
            pokemon
        );
    }
);

try {

    const storedTeam =
        localStorage.getItem(
            TEAM_KEY
        );

    team =
        storedTeam
            ? JSON.parse(storedTeam)
            : [];

} catch (error) {

    console.warn(
        "Time salvo inválido. Limpando..."
    );

    localStorage.removeItem(
        TEAM_KEY
    );

    team = [];
}

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

        renderRecommendations();

        addPokemonButton.addEventListener(
            "click",
            addPokemonToTeam
        );
    }
);

pokemonInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
        ) {

            event.preventDefault();

            addPokemonToTeam();
        }
    }
);

// =========================
// Funções de Persistência
// =========================
function saveTeam() {

    try {

        localStorage.setItem(
            TEAM_KEY,
            JSON.stringify(
                team
            )
        );

    } catch (error) {

        console.warn(
            "Limite do localStorage atingido."
        );
    }
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

            const speciesResponse =
                await fetch(
                    `https://pokeapi.co/api/v2/pokemon-species/${pokemonName}`
                );

            if (speciesResponse.ok) {

                const speciesData =
                    await speciesResponse.json();

                let selectedPokemonUrl =
                    null;

                const exactVariety =
                    speciesData.varieties.find(
                        variety =>
                            variety.pokemon.name ===
                            pokemonName
                    );

                if (exactVariety) {

                    selectedPokemonUrl =
                        exactVariety.pokemon.url;

                } else {

                    const defaultVariety =
                        speciesData.varieties.find(
                            variety =>
                                variety.is_default
                        );

                    if (!defaultVariety) {

                        throw new Error(
                            "Forma padrão não encontrada."
                        );
                    }

                    selectedPokemonUrl =
                        defaultVariety.pokemon.url;
                }

                const response =
                    await fetch(
                        selectedPokemonUrl
                    );

                if (!response.ok) {

                    throw new Error(
                        "Erro ao buscar Pokémon."
                    );
                }

                pokemonData =
                    await response.json();

            } else {

                console.log(
                    "pokemon-species falhou, tentando endpoint pokemon..."
                );

                const pokemonResponse =
                    await fetch(
                        `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
                    );

                if (!pokemonResponse.ok) {

                    throw new Error(
                        "Pokémon não encontrado."
                    );
                }

                pokemonData =
                    await pokemonResponse.json();
            }

            // Salva no cache
            pokemonCache.set(
                pokemonData.name,
                compressPokemonData(
                    pokemonData
                )
            );
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
        const compactPokemon =
            compressPokemonData(
                pokemonData
            );

        team.push(
            compactPokemon
        );

        saveTeam();

        renderTeam();

        renderOverview();

        clearRecommendedPokemon();

        renderRecommendations();

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

        const typeBadges =
            pokemon.types
                .map(type => {

                    const typeName =
                        type.type.name;

                    return `
                        <span
                            class="pokemon-type-badge"
                            style="
                                background-color:
                                    ${TYPE_COLORS[typeName]};
                            "
                        >
                            ${typeName}
                        </span>
                    `;
                })
                .join("");

        card.innerHTML = `
            <div class="pokemon-image">
                <img
                    src="${sprite}"
                    alt="${pokemon.name}"
                >
            </div>

            <div class="pokemon-info">
                <h3>
                    ${pokemon.name}
                </h3>

                <div class="pokemon-types">
                    ${typeBadges}
                </div>

                <p class="remove-hint">
                    Clique para remover
                </p>
            </div>
        `;

        card.classList.add(
            "team-card"
        );

        card.addEventListener(
            "click",
            () =>
                removePokemon(index)
        );

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

    renderRecommendations();
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

function calculateCoverageMatrix(
    teamToEvaluate = team
) {

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

    teamToEvaluate.forEach(pokemon => {

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

function calculateWeaknessPenalty(
    matrix
) {

    let penalty = 0;

    Object.values(matrix).forEach(
        coverage => {

            const score =
                calculateCoverageScore(
                    coverage
                );

            if (
                score < 0
            ) {

                penalty +=
                    Math.abs(
                        score
                    ) ** 2;
            }
        }
    );

    return penalty;
}

function createVirtualPokemon(
    primaryType,
    secondaryType = null
) {

    const types = [

        {
            type: {
                name: primaryType
            }
        }
    ];

    if (
        secondaryType
    ) {

        types.push({

            type: {
                name: secondaryType
            }
        });
    }

    return {

        id: -1,

        name: "virtual",

        types
    };
}

function calculateTeamScore(
    teamToEvaluate
) {

    const matrix =
        calculateCoverageMatrix(
            teamToEvaluate
        );

    return -calculateWeaknessPenalty(
        matrix
    );
}

function evaluateTypeCombinations(
    primaryType
) {

    const combinations = [];

    const monoTypePokemon =
        createVirtualPokemon(
            primaryType
        );

    const monoTypeTeam = [

        ...team,

        monoTypePokemon
    ];

    const monoTypeScore =
        calculateTeamScore(
            monoTypeTeam
        );

    combinations.push({

        primaryType,

        secondaryType: null,

        score: monoTypeScore
    });

    Object.keys(typeCache)
        .forEach(
            secondaryType => {

                if (
                    secondaryType ===
                    primaryType
                ) {
                    return;
                }

                const virtualPokemon =
                    createVirtualPokemon(
                        primaryType,
                        secondaryType
                    );

                const simulatedTeam = [

                    ...team,

                    virtualPokemon
                ];

                const score =
                    calculateTeamScore(
                        simulatedTeam
                    );

                combinations.push({

                    primaryType,

                    secondaryType,

                    score
                });
            }
        );

    combinations.sort(
        (a, b) =>
            b.score - a.score
    );

    return combinations;
}

function buildCombinationRanking(
    primaryType
) {

    const ranking =
        evaluateTypeCombinations(
            primaryType
        );

    const map = {};

    ranking.forEach(
        (
            combination,
            index
        ) => {

            const key =
                combination.secondaryType

                    ? `${combination.primaryType}/${combination.secondaryType}`

                    : combination.primaryType;

            map[key] = index;
        }
    );

    return map;
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

function scoreDefensiveType(
    candidateType,
    weaknesses
) {

    let score = 0;

    const candidateData =
        typeCache[candidateType];

    if (!candidateData) {
        return 0;
    }

    weaknesses.forEach(
        ([weakType]) => {

            if (
                candidateData.damage_relations
                    .no_damage_from
                    .some(
                        t =>
                        t.name === weakType
                    )
            ) {
                score += 4;
            }

            if (
                candidateData.damage_relations
                    .half_damage_from
                    .some(
                        t =>
                        t.name === weakType
                    )
            ) {
                score += 2;
            }

            if (
                candidateData.damage_relations
                    .double_damage_from
                    .some(
                        t =>
                        t.name === weakType
                    )
            ) {
                score -= 2;
            }
        }
    );

    return score;
}

function getRecommendedTypes() {

    const weaknesses =
        getTeamWeaknesses();

    return Object.keys(typeCache)

        .map(type => ({

            type,

            score:
                scoreDefensiveType(
                    type,
                    weaknesses
                )
        }))

        .sort(
            (a, b) =>
                b.score - a.score
        )

        .slice(0, 5);
}

function renderRecommendations() {

    const container =
        document.getElementById(
            "recommendations"
        );

    if (
        team.length < 1
    ) {

        const recommendedPokemon =
            document.getElementById(
                "recommendedPokemon"
            );

        container.innerHTML = `
            <p class="team-empty-message">
                Time vazio (${team.length}/6).
                Adicione algum Pokémon para receber recomendações.
            </p>
        `;

        recommendedPokemon.innerHTML = "";

        return;
    }

    if (
        team.length >= 6
    ) {

        const recommendedPokemon =
            document.getElementById(
                "recommendedPokemon"
            );

        container.innerHTML = `
            <p class="team-full-message">
                Time completo (${team.length}/6).
                Remova algum Pokémon para receber recomendações.
            </p>
        `;

        recommendedPokemon.innerHTML = "";

        return;
    }

    if (!container) return;

    container.innerHTML = "";

    const recommendations =
        getRecommendedTypes();

    recommendations.forEach(
        recommendation => {

            const button =
                document.createElement(
                    "button"
                );

            button.className =
                "recommendation-button";

            button.textContent =
                `${recommendation.type} (${recommendation.score})`;

            button.addEventListener(
                "click",
                () => {

                    showPokemonForType(
                        recommendation.type
                    );
                }
            );

            container.appendChild(
                button
            );
        }
    );
}

function calculateBST(
    pokemon
) {

    return pokemon.stats.reduce(
        (total, stat) =>
            total +
            stat.base_stat,
        0
    );
}

async function getSpeciesData(
    speciesUrl
) {

    if (
        speciesCache[speciesUrl]
    ) {

        return speciesCache[
            speciesUrl
        ];
    }

    const response =
        await fetch(
            speciesUrl
        );

    if (!response.ok) {

        return {

            is_baby: false,

            is_legendary: false,

            is_mythical: false
        };
    }

    const data =
        await response.json();

    speciesCache[speciesUrl] = {

        is_baby:
            data.is_baby,

        is_legendary:
            data.is_legendary,

        is_mythical:
            data.is_mythical
    };

    saveSpeciesCache();

    return speciesCache[
        speciesUrl
    ];
}

function clearRecommendedPokemon() {

    const container =
        document.getElementById(
            "recommendedPokemon"
        );

    container.innerHTML = "";
}

async function showPokemonForType(
    typeName
) {

    const container =
        document.getElementById(
            "recommendedPokemon"
        );

    container.innerHTML =
        "<p>Carregando...</p>";

    try {

        const typeData =
            typeCache[typeName];

        const combinationRanking =
            buildCombinationRanking(
                typeName
            );

        const pokemonList =
            typeData.pokemon
                .slice(0, 150);

        const candidatePromises =
            pokemonList.map(
                async entry => {

                    const name =
                        entry.pokemon.name;

                    if (
                        EXCLUDED_FORMS.some(
                            suffix =>
                                name.includes(
                                    suffix
                                )
                        )
                    ) {

                        return null;
                    }

                    let pokemon;

                    if (
                        pokemonCache.has(
                            name
                        )
                    ) {

                        pokemon =
                            pokemonCache.get(
                                name
                            );

                    } else {

                        const response =
                            await fetch(
                                entry.pokemon.url
                            );

                        pokemon =
                            compressPokemonData(
                                await response.json()
                            );

                        pokemonCache.set(
                            name,
                            pokemon
                        );
                    }

                    const species =
                        await getSpeciesData(
                            pokemon.species.url
                        );

                    if (
                        species.is_baby ||
                        species.is_legendary ||
                        species.is_mythical
                    ) {

                        return null;
                    }

                    let rankingKey;

                    if (
                        pokemon.types.length === 1
                    ) {

                        rankingKey =
                            typeName;

                    } else {

                        const secondaryType =
                            pokemon.types.find(
                                t =>
                                    t.type.name !==
                                    typeName
                            )?.type?.name;

                        rankingKey =
                            `${typeName}/${secondaryType}`;
                    }

                    return {

                        pokemon,

                        bst:
                            pokemon.bst ??
                            calculateBST(
                                pokemon
                            ),

                        combinationRank:

                            combinationRanking[
                                rankingKey
                            ] ?? 999
                    };
                }
            );

        const candidates =
            (
                await Promise.all(
                    candidatePromises
                )
            ).filter(
                candidate =>
                    candidate !== null
            );

        candidates.sort(
            (a, b) =>
                b.bst - a.bst
        );

        const topHalf =
            candidates.slice(
                0,
                Math.ceil(
                    candidates.length / 2
                )
            );
        
        topHalf.sort(
            (a, b) => {

                if (
                    a.combinationRank !==
                    b.combinationRank
                ) {

                    return (
                        a.combinationRank -
                        b.combinationRank
                    );
                }

                return (
                    b.bst - a.bst
                );
            }
        );

        const recommendations =
            topHalf.slice(0,18);

        renderRecommendedPokemon(
            recommendations
        );

    } catch (error) {

        console.error(error);

        container.innerHTML =
            "<p>Erro ao carregar recomendações.</p>";
    }
}

async function addRecommendedPokemon(
    pokemon
) {

    if (
        team.length >= 6
    ) {

        alert(
            "Seu time já possui 6 Pokémon."
        );

        return;
    }

    const alreadyExists =
        team.some(
            teamPokemon =>
                teamPokemon.id === pokemon.id
        );

    if (
        alreadyExists
    ) {

        alert(
            "Esse Pokémon já está no time."
        );

        return;
    }

    team.push(
        pokemon
    );

    saveTeam();

    renderTeam();

    renderOverview();

    clearRecommendedPokemon();

    renderRecommendations();
}

function renderRecommendedPokemon(
    candidates
) {

    const container =
        document.getElementById(
            "recommendedPokemon"
        );

    container.innerHTML = "";

    candidates.forEach(
        candidate => {

            const pokemon =
                candidate.pokemon;

            const card =
                document.createElement(
                    "div"
                );

            const typeBadges =
                pokemon.types
                    .map(type => {

                        const typeName =
                            type.type.name;

                        return `
                            <span
                                class="pokemon-type-badge"
                                style="
                                    background-color:
                                        ${TYPE_COLORS[typeName]};
                                "
                            >
                                ${typeName}
                            </span>
                        `;
                    })
                    .join("");

            card.className =
                "pokemon-card recommended-card";

            card.innerHTML = `
                <div class="pokemon-image">
                    <img
                        src="${pokemon.sprites.front_default}"
                        alt="${pokemon.name}"
                    >
                </div>

                <div class="pokemon-info">

                    <h3>
                        ${pokemon.name}
                    </h3>

                    <div class="pokemon-types">
                        ${typeBadges}
                    </div>

                    <p class="click-hint">
                        Clique para adicionar
                    </p>

                </div>
            `;

            card.addEventListener(
                "click",
                () => addRecommendedPokemon(
                    pokemon
                )
            );

            container.appendChild(card);
        }
    );
}

function renderOverview() {

    const overview = document.getElementById("overview");

    overview.innerHTML = "";

    const matrix = calculateCoverageMatrix();

    Object.entries(matrix)
        .sort((a, b) => {
            return (calculateCoverageScore(a[1]) - calculateCoverageScore(b[1]));
        })

        .forEach(
            ([type, coverage]) => {

                const score = calculateCoverageScore(coverage);

                const card = document.createElement("div");

                card.className = "overview-card";

                card.style.background =
                    TYPE_COLORS[type];

                card.style.color =
                    "white";

                card.innerHTML = `

                    <div class="overview-type">
                        ${type}
                    </div>

                    <div class="overview-score">
                        ${score}
                    </div>

                    <div class="overview-tooltip">

                        <p>Imunes: ${coverage.immune}</p>

                        <p>Muito Resistentes: ${coverage.veryResistant}</p>

                        <p>Resistentes: ${coverage.resistant}</p>

                        <p>Neutros: ${coverage.neutral}</p>

                        <p>Fracos: ${coverage.weak}</p>

                        <p>Muito Fracos: ${coverage.veryWeak}</p>

                    </div>
                `;

                overview.appendChild(card);
            }
        );
}
