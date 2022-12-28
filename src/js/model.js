import {API_URL, API_KEY, SEARCH_RESULTS_PER_PAGE} from './config';
import {AJAX} from './helpers';
import recipeView from './views/recipeView';
import { store } from 'core-js/internals/reflect-metadata';

export const state = {
  recipe: {},
  search: {
    query: "",
    results: [],
    page: 1,
    resultsPerPage: SEARCH_RESULTS_PER_PAGE
  },
  bookmarks: []
};

const parseAPIRecipe = function(apiRecipe) {
  return {
    id: apiRecipe.id,
    title: apiRecipe.title,
    publisher: apiRecipe.publisher,
    sourceUrl: apiRecipe.source_url,
    image: apiRecipe.image_url,
    servings: apiRecipe.servings,
    cookingTime: apiRecipe.cooking_time,
    ingredients: apiRecipe.ingredients,
    ...(apiRecipe.key && {key: apiRecipe.key})
  };
}

// calls forkify API adn get recipe data based on id
export const loadRecipe = async function(id) {
  try {
    const data = await AJAX(`${API_URL}${id}?key=${API_KEY}`);

    const {recipe} = data.data;
    state.recipe = parseAPIRecipe(recipe);

    // check if this was a previously bookmarked recipe
    state.recipe.bookmarked = state.bookmarks.some(b => b.id === state.recipe.id);
  } catch(err){
    // temporary error handling
    throw err;
  }
};

export const updateServings = function(newServings) {
  // calculate delta change in servings
  const changeMulti = newServings / state.recipe.servings;

  // change all ingredient servings
  const newIng = state.recipe.ingredients.map(ing => {
    if (ing.quantity)
      ing.quantity = ing.quantity * changeMulti;
    return ing;
  });

  state.recipe.ingredients = newIng;
  state.recipe.servings = newServings;
}

export const loadSearchResults = async function(query) {
  try {
    const data = await AJAX(`${API_URL}?search=${query}&key=${API_KEY}`)

    const {recipes} = data.data;
    state.search.query = query;
    state.search.results = recipes.map( rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && {key: rec.key})
      };
    });

  } catch (err) {
    throw err;
  }
}

export const getSearchResultsPage = function(page = state.search.page) {
  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;

  state.search.page = page;

  return state.search.results.slice(start, end);
}

const persistBookmarks = function() {
  localStorage.setItem("bookmarks", JSON.stringify(state.bookmarks));
}

export const addBookmark = function(recipe) {
  // add recipe to bookmarks
  state.bookmarks.push(recipe);

  // mark current recipe as bookmarked
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  // save bookmarks
  persistBookmarks();
}

export const deleteBookmark = function(id) {
  // find index
  const index = state.bookmarks.findIndex(el => el.id === id);

  // remove recipe from bookmarks
  state.bookmarks.splice(index, 1);

  // mark current recipe as not bookmarked
  if (id === state.recipe.id) state.recipe.bookmarked = false;

  // save bookmarks
  persistBookmarks();
}

export const uploadRecipe = async function(newRecipe) {
  try {
    // parse ingredients
    const ingredients = Object.entries(newRecipe)
      // filter recipe info for only filled ingredient info
      .filter(entry => entry[0].startsWith("ingredient") && entry[1] !== "")
      .map(ing => {
        // destructure ingredient strings to get data
        const ingArr = ing[1].split(",").map(el => el.trim());

        // input validation
        if (ingArr.length !== 3) throw new Error("Wrong Ingredient Format. Please use the correct format.");
        const [quantity, unit, description] = ingArr;

        // return data object
        return {quantity: quantity? +quantity: null, unit, description};
      });

    // create API object
    const uploadRecipe = {
      title: newRecipe.title,
      publisher: newRecipe.publisher,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      servings: +newRecipe.servings,
      cooking_time: +newRecipe.cookingTime,
      ingredients
    };

    // send recipe to API
    const res = await AJAX(`${API_URL}?key=${API_KEY}`, uploadRecipe);

    // parse recipe and set it to the current recipe
    state.recipe = parseAPIRecipe(res.data.recipe);

    // add recipe to bookmarks
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
}

const init = function() {
  // load saved bookmarks if there are any
  const savedBookmarks = localStorage.getItem("bookmarks");
  if (savedBookmarks) state.bookmarks = JSON.parse(savedBookmarks);
}
init();

export const clearBookmarks = function() {
  localStorage.clear("bookmarks");
}
// clear bookmarks (Debugging Only)
//clearBookmarks();