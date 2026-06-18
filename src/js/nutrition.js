import NutritionData from './NutritionData.mjs';

const dataSource = new NutritionData();
const searchInput = document.getElementById('food-search');
const analyzeBtn = document.getElementById('analyze-btn');
const resultsList = document.getElementById('nutrition-results');
const spinner = document.getElementById('loading-spinner');

function nutritionCardTemplate(food) {
  return `
    <li class="nutrition-card">
      ${food.photo.thumb ? `<img src="${food.photo.thumb}" alt="${food.food_name}" />` : ''}
      <div class="nutrition-card__info">
        <p class="nutrition-card__name">${food.food_name}</p>
        <p style="color: var(--text-muted); font-size: 0.85rem;">
          Serving: ${food.serving_qty} ${food.serving_unit} (${food.serving_weight_grams}g)
        </p>
        <div class="macros">
          <div class="macro">
            <p class="macro__value">${Math.round(food.nf_calories)}</p>
            <p class="macro__label">Calories</p>
          </div>
          <div class="macro">
            <p class="macro__value">${Math.round(food.nf_protein)}g</p>
            <p class="macro__label">Protein</p>
          </div>
          <div class="macro">
            <p class="macro__value">${Math.round(food.nf_total_carbohydrate)}g</p>
            <p class="macro__label">Carbs</p>
          </div>
          <div class="macro">
            <p class="macro__value">${Math.round(food.nf_total_fat)}g</p>
            <p class="macro__label">Fat</p>
          </div>
        </div>
      </div>
    </li>
  `;
}

function showSpinner() {
  spinner.classList.add('active');
}

function hideSpinner() {
  spinner.classList.remove('active');
}

async function analyzeFood() {
  const query = searchInput.value.trim();
  if (!query) return;

  localStorage.setItem('ff-last-nutrition-search', query);

  showSpinner();
  resultsList.innerHTML = '';

  try {
    const foods = await dataSource.getNutrients(query);
    resultsList.innerHTML = foods.map(nutritionCardTemplate).join('');
  } catch (err) {
    resultsList.innerHTML = `<p style="color: var(--primary);">Error: ${err.message}</p>`;
  }

  hideSpinner();
}

analyzeBtn.addEventListener('click', analyzeFood);

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') analyzeFood();
});

// Restore last nutrition search from localStorage
const lastNutritionSearch = localStorage.getItem('ff-last-nutrition-search');
if (lastNutritionSearch) {
  searchInput.value = lastNutritionSearch;
}
