import {MODAL_SUCCESS_CLOSE_TIMEOUT_SEC} from './config';
import "core-js/stable";
import "regenerator-runtime/runtime";
import * as model from "./model";
import recipeView from './views/recipeView';
import searchView from './views/searchView';
import resultsView from './views/resultsView';
import paginationView from './views/paginationView';
import bookmarksView from './views/bookmarksView';
import addRecipeView from './views/addRecipeView';
import { addBookmark } from './model';

/*if (module.hot) {
  module.hot.accept();
}*/

// Custom API documentation: forkify API
// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipes = async function () {
  try{
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    // update selected result in results list and bookmarks
    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);

    // get recipe
    await model.loadRecipe(id);
    const {recipe} = model.state;


    // render recipe
    recipeView.render(recipe);
  }catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async function() {
  try {
    const query = searchView.getQuery();

    if (!query) return;

    resultsView.renderSpinner();

    await model.loadSearchResults(query);

    resultsView.render(model.getSearchResultsPage(1));
    paginationView.render(model.state.search);
  } catch (err) {
    resultsView.renderError();
    console.error(err);
  }
}

const controlPagination = function(page) {
  // render new results
  resultsView.render(model.getSearchResultsPage(page));

  // render new pagination buttons
  paginationView.render(model.state.search);
}

const controlChangeServings = function(newServings) {
  // update recipe servings
  model.updateServings(newServings);

  // update recipe view
  recipeView.update(model.state.recipe);
}

const controlAddBookmark = function() {
  // if not bookmarked, bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);

  // if bookmarked, un bookmark
  else if (model.state.recipe.bookmarked) model.deleteBookmark(model.state.recipe.id);

  // update recipe view
  recipeView.update(model.state.recipe);

  // render bookmarks
  bookmarksView.render(model.state.bookmarks);
}

const controlRenderBookmarks = function() {
  // render bookmarks to view
  bookmarksView.render(model.state.bookmarks);
}

const controlAddRecipe = async function(newRecipe) {
  try {
    // render spinner in window
    addRecipeView.renderSpinner();

    // send data to API
    await model.uploadRecipe(newRecipe);

    // render added recipe
    recipeView.render(model.state.recipe);

    // show success message
    addRecipeView.renderMessage();

    // rerender bookmark view
    bookmarksView.render(model.state.bookmarks);

    // update url
    window.history.pushState(null,"",`#${model.state.recipe.id}`);

    // close model window after a bit
    setTimeout(function(){
      addRecipeView.toggleWindow();
    }, MODAL_SUCCESS_CLOSE_TIMEOUT_SEC * 1000);

  } catch (err) {
    //console.error(err);
    addRecipeView.renderError(err.message);
  }
}

// handle page initialization functionality
const init = function() {
  // link UI handlers to controller functions
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateIng(controlChangeServings);
  recipeView.addHandlerBookmarkClick(controlAddBookmark);
  searchView.addSearchHandler(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  bookmarksView.addHandlerRender(controlRenderBookmarks());
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();