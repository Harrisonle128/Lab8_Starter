// main.js

// CONSTANTS
const RECIPE_URLS = [
  'recipes/1_50-thanksgiving-side-dishes.json',
  'recipes/2_roasting-turkey-breast-with-stuffing.json',
  'recipes/3_moms-cornbread-stuffing.json',
  'recipes/4_50-indulgent-thanksgiving-side-dishes-for-any-holiday-gathering.json',
  'recipes/5_healthy-thanksgiving-recipe-crockpot-turkey-breast.json',
  'recipes/6_one-pot-thanksgiving-dinner.json',
];
// Run the init() function when the page has loaded
window.addEventListener('DOMContentLoaded', init);

// Starts the program, all function calls trace back here
async function init() {
  // initialize ServiceWorker
  initializeServiceWorker();
  // Get the recipes from localStorage
  let recipes;
  try {
    recipes = await getRecipes();
  } catch (err) {
    console.error(err);
  }
  // Add each recipe to the <main> element
  addRecipesToDocument(recipes);
}

/**
 * Detects if there's a service worker, then loads it and begins the process
 * of installing it and getting it running
 */
function initializeServiceWorker() {
  // B1. Check for serviceWorker support
  if ('serviceWorker' in navigator) {
    // B2. Listen for page load
    window.addEventListener('load', () => {
      // B3. Register the service worker
      navigator.serviceWorker.register('./sw.js')
        .then(registration => {
          // B4. Success
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
          // B5. Failure
          console.error('Service Worker registration failed:', error);
        });
    });
  }
}


/**
 * Reads 'recipes' from localStorage and returns an array of
 * all of the recipes found (parsed, not in string form). If
 * nothing is found in localStorage, network requests are made to all
 * of the URLs in RECIPE_URLs, an array is made from those recipes, that
 * array is saved to localStorage, and then the array is returned.
 * @returns {Array<Object>} An array of recipes found in localStorage
 */
async function getRecipes() {
  // A1. Check if there are recipes in localStorage
  const saved = localStorage.getItem('recipes');
  if (saved) {
    return JSON.parse(saved);
  }

  // A2. Empty array to store fetched recipes
  const recipes = [];

  // A3. Return a Promise
  return new Promise(async (resolve, reject) => {
    for (let i = 0; i < RECIPE_URLS.length; i++) {
      try {
        // A6. Fetch the recipe
        const response = await fetch(RECIPE_URLS[i]);

        // A7. Get the JSON
        const data = await response.json();

        // A8. Add to recipes array
        recipes.push(data);

        // A9. Check if all recipes are fetched
        if (recipes.length === RECIPE_URLS.length) {
          saveRecipesToStorage(recipes);
          resolve(recipes);
        }

      } catch (err) {
        // A10. Log the error
        console.error(`Error fetching recipe ${i + 1}:`, err);

        // A11. Reject the Promise
        reject(err);
      }
    }
  });
}


/**
 * Takes in an array of recipes, converts it to a string, and then
 * saves that string to 'recipes' in localStorage
 * @param {Array<Object>} recipes An array of recipes
 */
function saveRecipesToStorage(recipes) {
  localStorage.setItem('recipes', JSON.stringify(recipes));
}

/**
 * Takes in an array of recipes and for each recipe creates a
 * new <recipe-card> element, adds the recipe data to that card
 * using element.data = {...}, and then appends that new recipe
 * to <main>
 * @param {Array<Object>} recipes An array of recipes
 */
function addRecipesToDocument(recipes) {
  if (!recipes) return;
  let main = document.querySelector('main');
  recipes.forEach((recipe) => {
    let recipeCard = document.createElement('recipe-card');
    recipeCard.data = recipe;
    main.append(recipeCard);
  });
}