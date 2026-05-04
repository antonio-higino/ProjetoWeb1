const team = [];
const recommendations = [];

function addPokemon() {
    const input = document.getElementById("pokemonInput");
    const name = input.value.trim();

    if (name && team.length < 6) {
    team.push(name);
    input.value = "";
    renderTeam();
    }
}

function renderTeam() {
    const container = document.getElementById("team");
    container.innerHTML = "";

    team.forEach(pokemon => {
    const div = document.createElement("div");
    div.className = "pokemon";
    div.innerText = pokemon;
    container.appendChild(div);
    });
}

function renderRecommendations() {
    const container = document.getElementById("recommendations");
    container.innerHTML = "";

    recommendations.forEach(pokemon => {
    const btn = document.createElement("button");
    btn.className = "secondary";
    btn.innerText = pokemon;
    btn.onclick = () => {
        if (team.length < 6) {
        team.push(pokemon);
        renderTeam();
        }
    };
    container.appendChild(btn);
    });
}

function generateTeam() {
    alert("Função de geração completa ainda não implementada");
}

renderRecommendations();