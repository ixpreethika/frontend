const API = "https://pokeapi.co/api/v2/pokemon/";
const input = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const randomBtn = document.getElementById("randomBtn");
const compareBtn = document.getElementById("compareBtn");
const suggestions = document.getElementById("suggestions");
const resultArea = document.getElementById("resultArea");
const grid = document.getElementById("pokemonGrid");
const sortSelect = document.getElementById("sortSelect");

let pokemonNames = [];
let compareMode = false;
let compareList = [];
let offset = 0;
let loading = false;
let tooltip = null;
let loadedPokemon = [];

const typeColors = {
  fire: "#f87171",
  water: "#60a5fa",
  grass: "#4ade80",
  electric: "#facc15",
  psychic: "#f472b6",
  ice: "#7dd3fc",
  dragon: "#a78bfa",
  dark: "#374151",
  fairy: "#f9a8d4",
  normal: "#e5e7eb",
  fighting: "#fb923c",
  flying: "#c4b5fd",
  poison: "#c084fc",
  ground: "#eab308",
  rock: "#a3a3a3",
  bug: "#a3e635",
  ghost: "#818cf8",
  steel: "#94a3b8",
};

// LOAD NAMES FOR AUTOCOMPLETE
(async () => {
  const res = await fetch(API + "?limit=1000");
  pokemonNames = (await res.json()).results.map((p) => p.name);
})();

// ENTER SEARCH
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchPokemon();
});

// AUTOCOMPLETE
input.oninput = () => {
  const val = input.value.toLowerCase();
  if (!val) {
    suggestions.classList.add("hidden");
    return;
  }

  const matches = pokemonNames.filter((n) => n.includes(val)).slice(0, 6);

  suggestions.innerHTML = matches
    .map(
      (m) =>
        `<div class="p-2 hover:bg-gray-100 cursor-pointer capitalize">${m}</div>`,
    )
    .join("");

  suggestions.classList.remove("hidden");

  [...suggestions.children].forEach((el) => {
    el.onclick = () => {
      input.value = el.textContent;
      suggestions.classList.add("hidden");
      searchPokemon();
    };
  });
};

document.onclick = (e) => {
  if (!input.contains(e.target)) suggestions.classList.add("hidden");
};

//BALL ANIMATION
async function throwBall() {
  const btn = searchBtn.getBoundingClientRect();

  const ball = document.createElement("div");
  ball.className = "cineBall";
  ball.style.left = btn.left + btn.width / 2 + "px";
  ball.style.top = btn.top + "px";

  document.body.appendChild(ball);

  // throw
  ball.classList.add("throwAnim");
  await new Promise((r) => setTimeout(r, 600));

  // shake
  ball.classList.remove("throwAnim");
  ball.classList.add("shakeAnim");
  await new Promise((r) => setTimeout(r, 500));

  // flash
  const flash = document.createElement("div");
  flash.className = "flash";
  document.body.appendChild(flash);

  //open
  ball.classList.remove("shakeAnim");

  const top = document.createElement("div");
  const bottom = document.createElement("div");

  top.style.cssText =
    "position:absolute;width:100%;height:50%;background:red;border-bottom:4px solid black;border-radius:80px 80px 0 0;";
  bottom.style.cssText =
    "position:absolute;width:100%;height:50%;bottom:0;background:white;border-radius:0 0 80px 80px;";

  ball.innerHTML = "";
  ball.appendChild(top);
  ball.appendChild(bottom);

  top.classList.add("openTop");
  bottom.classList.add("openBottom");

  await new Promise((r) => setTimeout(r, 450));

  ball.remove();
  flash.remove();
}

//SEARCH
searchBtn.onclick = searchPokemon;

async function searchPokemon() {
  if (!input.value.trim()) return;

  await throwBall();

  const res = await fetch(API + input.value.toLowerCase());
  if (!res.ok) {
    alert("Pokemon not found");
    return;
  }

  const p = await res.json();
  displayPokemon(p, false);
}

//RANDOM
randomBtn.onclick = async () => {
  await throwBall();
  const id = Math.floor(Math.random() * 898) + 1;
  const p = await fetch(API + id).then((r) => r.json());
  displayPokemon(p, false);
};

// COMPARE
compareBtn.onclick = () => {
  compareMode = true;
  compareList = [];
  alert("Select two Pokémon");
};

// DISPLAY
function displayPokemon(p, fromGallery) {
  if (compareMode) {
    compareList.push(p);

    if (compareList.length === 2) {
      const modal = document.createElement("div");
      modal.className =
        "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";

      modal.innerHTML = `
<div class="bg-white p-6 rounded-xl flex gap-6 relative">
<button class="absolute top-2 right-3 text-xl">✖</button>
${cardHTML(compareList[0])}
${cardHTML(compareList[1])}
</div>`;

      modal.querySelector("button").onclick = () => modal.remove();
      document.body.appendChild(modal);

      compareMode = false;
      compareList = [];
    }
    return;
  }

  if (fromGallery) {
    showModal(p);
    return;
  }

  resultArea.innerHTML = `<div class="flex justify-center">${cardHTML(p)}</div>`;
}

// CARD
function cardHTML(p) {
  const types = p.types.map((t) => t.type.name);
  const base = typeColors[types[0]] || "#ddd";

  const stats = p.stats
    .map(
      (s) => `
<div class="text-left mb-2">
<div class="flex justify-between text-sm font-medium">
<span>${s.stat.name}</span><span>${s.base_stat}</span>
</div>
<div class="bg-white/40 h-2 rounded">
<div class="bg-black/70 h-2 rounded" style="width:${Math.min(s.base_stat, 100)}%"></div>
</div>
</div>`,
    )
    .join("");

  return `
<div class="rounded-2xl p-5 w-72 shadow-xl"
style="background:linear-gradient(135deg,${base},#ffffffcc);box-shadow:0 15px 40px ${base}">
<img src="${p.sprites.other["official-artwork"].front_default || p.sprites.front_default}"
class="mx-auto w-40">
<h2 class="text-xl font-bold capitalize">${p.name}</h2>
<div class="flex gap-2 justify-center my-2">
${types.map((t) => `<span class="px-3 py-1 rounded-full text-xs bg-black/20 capitalize">${t}</span>`).join("")}
</div>
${stats}
</div>`;
}

// MODAL
function showModal(p) {
  const modal = document.createElement("div");
  modal.className =
    "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
  modal.innerHTML = `<div class="relative">
<button class="absolute -top-2 -right-2 bg-white rounded-full px-2">✕</button>
${cardHTML(p)}
</div>`;
  modal.querySelector("button").onclick = () => modal.remove();
  document.body.appendChild(modal);
}

//GALLERY
async function loadGallery() {
  if (loading) return;
  loading = true;

  const res = await fetch(`${API}?limit=20&offset=${offset}`);
  const data = await res.json();

  for (const item of data.results) {
    const id = offset + 1;
    offset++;

    const div = document.createElement("div");
    div.className =
      "rounded-xl shadow transition cursor-pointer hover:scale-95";

    const img = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

    div.innerHTML = `
<img src="${img}" class="mx-auto p-4">
<p class="text-center capitalize font-semibold pb-3">${item.name}</p>`;

    grid.appendChild(div);

    // load details async
    fetch(API + item.name)
      .then((r) => r.json())
      .then((p) => {
        loadedPokemon.push(p);

        const color = typeColors[p.types[0].type.name] || "#eee";
        div.style.background = `linear-gradient(135deg,${color},#ffffffaa)`;
        div.style.boxShadow = `0 10px 25px ${color}`;

        div.onclick = () => displayPokemon(p, true);

        // tooltip
        div.onmouseenter = (e) => {
          tooltip = document.createElement("div");
          tooltip.className = "tooltip";
          tooltip.innerHTML = `
<img src="${p.sprites.front_default}" class="w-16 mx-auto">
<p class="capitalize font-bold text-center">${p.name}</p>
<p class="text-xs text-center">${p.types.map((t) => t.type.name).join(", ")}</p>`;
          document.body.appendChild(tooltip);
        };

        div.onmousemove = (e) => {
          if (tooltip) {
            tooltip.style.left = e.pageX + 15 + "px";
            tooltip.style.top = e.pageY - 10 + "px";
          }
        };

        div.onmouseleave = () => {
          if (tooltip) {
            tooltip.remove();
            tooltip = null;
          }
        };
      });
  }

  loading = false;
}

// INFINITE SCROLL
window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
    loadGallery();
  }
});

//SORT
sortSelect.onchange = () => {
  if (!sortSelect.value) return;

  let arr = [...loadedPokemon];

  if (sortSelect.value === "name")
    arr.sort((a, b) => a.name.localeCompare(b.name));
  if (sortSelect.value === "hp")
    arr.sort((a, b) => b.stats[0].base_stat - a.stats[0].base_stat);
  if (sortSelect.value === "attack")
    arr.sort((a, b) => b.stats[1].base_stat - a.stats[1].base_stat);

  grid.innerHTML = "";

  arr.forEach((p) => {
    const div = document.createElement("div");
    const color = typeColors[p.types[0].type.name] || "#eee";

    div.className =
      "rounded-xl shadow transition cursor-pointer hover:scale-95";
    div.style.background = `linear-gradient(135deg,${color},#ffffffaa)`;
    div.style.boxShadow = `0 10px 25px ${color}`;

    div.innerHTML = `
<img src="${p.sprites.front_default}" class="mx-auto p-4">
<p class="text-center capitalize font-semibold pb-3">${p.name}</p>`;

    div.onclick = () => displayPokemon(p, true);
    grid.appendChild(div);
  });
};

loadGallery();
