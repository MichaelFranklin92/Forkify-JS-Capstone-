import View from './view';
import icons from 'url:../../img/icons.svg';
import previewView from './previewView';

class ResultsView extends View{
 _parentEl = document.querySelector(".results");

 _errorMessage = "No Recipes found. Please try again.";
 _successMessage = "";

 _generateMarkup() {
  return this._data.map(result => previewView.render(result, false)).join("");
 };
}

export default new ResultsView();
