const prepTimeSelect = document.getElementById("prep-time");
const typeCheckboxes = document.querySelectorAll("input[value^='with_meat'], input[value^='meatless'], input[value^='vegan']");
const methodCheckboxes = document.querySelectorAll("input[value^='one_pot'], input[value^='pan'], input[value^='oven'], input[value^='no_cooking']");
const sideDishCheckboxes = document.querySelectorAll("input[value^='bread'], input[value^='rice'], input[value^='salad'], input[value^='pasta'], input[value^='none']");
const recipeList = document.getElementById("recipe-list");
const selectedFilters = document.getElementById("selected-filters");
let recipes = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

fetch("data/recipes.json")
  .then(res => res.json())
  .then(data => {
    recipes = data;
    renderRecipes();
    renderFavorites();
  });

function getSelectedValues(nodeList) {
  return Array.from(nodeList)
    .filter(el => el.checked)
    .map(el => el.value);
}

function createBadge(label, callback) {
  const badge = document.createElement("span");
  badge.className = "badge";
  badge.innerHTML = `${label} <strong>×</strong>`;
  badge.addEventListener("click", callback);
  selectedFilters.appendChild(badge);
}

function attachFavoriteListeners() {
  document.querySelectorAll(".favorite").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      if (!favorites.includes(id)) {
        favorites.push(id);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        renderRecipes();
        renderFavorites();
      }
    });
  });

  document.querySelectorAll(".remove-favorite").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      favorites = favorites.filter(favId => favId !== id);
      localStorage.setItem("favorites", JSON.stringify(favorites));
      renderRecipes();
      renderFavorites();
    });
  });
}

function renderRecipes() {
  const selectedPrepTime = prepTimeSelect.value;
  const selectedTypes = getSelectedValues(typeCheckboxes);
  const selectedMethods = getSelectedValues(methodCheckboxes);
  const selectedSides = getSelectedValues(sideDishCheckboxes);

  selectedFilters.innerHTML = "";

  if (selectedPrepTime) {
    const label = prepTimeSelect.options[prepTimeSelect.selectedIndex].text;
    createBadge(`⏱️ ${label}`, () => {
      prepTimeSelect.value = "";
      renderRecipes();
    });
  }


  [...typeCheckboxes, ...methodCheckboxes, ...sideDishCheckboxes].forEach(cb => {
    if (cb.checked) {
      const label = cb.parentNode.textContent.trim();
      createBadge(label, () => {
        cb.checked = false;
        renderRecipes();
      });
    }
  });

  const filtered = recipes.filter(r => {
    const matchTime = !selectedPrepTime || r.prep_time === selectedPrepTime;
    const matchType = selectedTypes.length === 0 || selectedTypes.some(t => r.type.includes(t));
    const matchMethod = selectedMethods.length === 0 || selectedMethods.some(m => r.prep_method.includes(m));
    const matchSides = selectedSides.length === 0 || selectedSides.some(s => r.side_dish && r.side_dish.includes(s));
    return matchTime && matchType && matchMethod && matchSides;
  });

  recipeList.innerHTML = "";

  if (filtered.length === 0) {
    recipeList.innerHTML = "<p>Žádné recepty neodpovídají výběru.</p>";
    return;
  }

  filtered.forEach(r => {
    const wrapper = document.createElement("div");
    wrapper.className = "recipe";

    const isFav = favorites.includes(Number(r.id));
    const heartHTML = isFav
  ? `<button class="favorite added" data-id="${r.id}" title="Recept je v oblíbených">✅ Recept je v oblíbených</button>`
  : `<button class="favorite" data-id="${r.id}">💛 Přidat do oblíbených</button>`;



    wrapper.innerHTML = `
      <div class="recipe-header">
        <h3>${r.title}</h3>
      </div>
      <div class="recipe-image">
        <img src="images/${r.image}" alt="${r.title}">
      </div>
      ${heartHTML}
      <div class="recipe-detail">
        <p><strong>⏱️ Doba přípravy:</strong> ${translatePrepTime(r.prep_time)}</p>
        <p><strong>🍴 Typ:</strong> ${r.type.map(translateType).join(", ")}</p>
        <p><strong>🍲 Způsob:</strong> ${r.prep_method.map(translateMethod).join(", ")}</p>
        <p><strong>🥔 Příloha:</strong> ${r.side_dish ? r.side_dish.map(translateSideDish).join(", ") : ""}</p>
        <p><strong>🍽️ Počet porcí:</strong> ${r.servings || 4}</p>
        <p><strong>Suroviny:</strong></p>
        <ul>${r.ingredients.map(i => `<li>${i}</li>`).join("")}</ul>
        <p><strong>Postup:</strong> ${r.instructions}</p>
        ${r.tip ? `<p><strong>💡 Tip:</strong> ${r.tip}</p>` : ""}
      </div>
    `;

    recipeList.appendChild(wrapper);
  });

  attachFavoriteListeners();
}

function renderFavorites() {
  const favList = document.getElementById("favorites-list");
  if (!favList) return;
  favList.innerHTML = "";

  const favRecipes = recipes.filter(r => favorites.includes(Number(r.id)));
  if (favRecipes.length === 0) {
    favList.innerHTML = "<p>Nemáte žádné oblíbené recepty.</p>";
    return;
  }

  favRecipes.forEach(r => {
    const wrapper = document.createElement("div");
    wrapper.className = "recipe";

    wrapper.innerHTML = `
      <div class="recipe-header">
        <h3>${r.title}</h3>
          </div>
          <div class="recipe-image">
          <img src="images/${r.image}" alt="${r.title}">
          </div>
          <button class="remove-favorite" data-id="${r.id}">❌ Odebrat z oblíbených</button>
      </div>
      <div class="recipe-detail">
        <p><strong>⏱️ Doba přípravy:</strong> ${translatePrepTime(r.prep_time)}</p>
        <p><strong>🍴 Typ:</strong> ${r.type.map(translateType).join(", ")}</p>
        <p><strong>🍲 Způsob:</strong> ${r.prep_method.map(translateMethod).join(", ")}</p>
        <p><strong>🥔 Příloha:</strong> ${r.side_dish ? r.side_dish.map(translateSideDish).join(", ") : ""}</p>
        <p><strong>🍽️ Počet porcí:</strong> ${r.servings || 4}</p>
        <p><strong>Suroviny:</strong></p>
        <ul>${r.ingredients.map(i => `<li>${i}</li>`).join("")}</ul>
        <p><strong>Postup:</strong> ${r.instructions}</p>
        ${r.tip ? `<p><strong>💡 Tip:</strong> ${r.tip}</p>` : ""}
      </div>
    `;

    favList.appendChild(wrapper);
  });

  attachFavoriteListeners();
}

prepTimeSelect.addEventListener("change", renderRecipes);
typeCheckboxes.forEach(cb => cb.addEventListener("change", renderRecipes));
methodCheckboxes.forEach(cb => cb.addEventListener("change", renderRecipes));
sideDishCheckboxes.forEach(cb => cb.addEventListener("change", renderRecipes));

function translatePrepTime(value) {
  return {
    under_15: "Do 15 minut",
    under_30: "Do 30 minut",
    over_30: "Nad 30 minut",
  }[value] || value;
}

function translateType(value) {
  return {
    with_meat: "S masem",
    meatless: "Bez masa",
    vegan: "Veganské",
  }[value] || value;
}

function translateMethod(value) {
  return {
    one_pot: "Vařit v jednom hrnci",
    pan: "Orestovat na pánvi",
    oven: "Potřebuji troubu",
    no_cooking: "Bez vaření",
  }[value] || value;
}

function translateSideDish(value) {
  return {
    bread: "Pečivo",
    rice: "Rýže",
    salad: "Salát",
    pasta: "Těstoviny",
    none: "Bez přílohy",
  }[value] || value;
}

function showPage(page) {
  const filters = document.getElementById("filters");
  const recipeList = document.getElementById("recipe-list");
  const selectedFilters = document.getElementById("selected-filters");
  const favoritesPage = document.getElementById("favorites-page");
  const settingsPage = document.getElementById("settings-page");

  filters.classList.add("hidden");
  recipeList.classList.add("hidden");
  selectedFilters.classList.add("hidden");
  favoritesPage.classList.add("hidden");
  settingsPage.classList.add("hidden");

  if (page === "main") {
    filters.classList.remove("hidden");
    recipeList.classList.remove("hidden");
    selectedFilters.classList.remove("hidden");
    renderRecipes();
  } else if (page === "favorites") {
    favoritesPage.classList.remove("hidden");
    renderFavorites();
  } else if (page === "settings") {
    settingsPage.classList.remove("hidden");
  }
}

function openModal() {
  document.getElementById("support-modal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("support-modal").classList.add("hidden");
}
