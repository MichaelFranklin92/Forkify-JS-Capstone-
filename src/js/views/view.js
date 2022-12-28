import icons from 'url:../../img/icons.svg';

export default class View {
  _parentEl = document.querySelector('.recipe');
  _data;
  _errorMessage = "We could not find that recipe. Please try another one.";
  _successMessage = "";

  // renders the view
  render (data, render = true) {
    this._data = data;

    if (!data || (Array.isArray(data) && data.length === 0)) return this.renderError();

    // generate markup
    const html = this._generateMarkup();

    // if we are not rendering this markup, return it
    if (!render) return html;

    // insert markup
    this._clear();
    this.  _parentEl.insertAdjacentHTML("afterbegin", html);
  };

  // updates the view, rendering changes only
  update (data) {
    this._data = data;
    // generate new markup
    const newHtml = this._generateMarkup();

    // create new virtual DOM
    const newDOM = document.createRange().createContextualFragment(newHtml);
    const newElements = Array.from(newDOM.querySelectorAll("*"));
    const currElements = Array.from(this._parentEl.querySelectorAll("*"));

    // compare new elements to old
    newElements.forEach((newEl, i) => {
      const currEl = currElements[i];

      // change text
      if (!newEl.isEqualNode(currEl) && newEl.firstChild?.nodeValue.trim() !== "") {
          currEl.textContent = newEl.textContent;
      }

      // change attributes
      if (!newEl.isEqualNode(currEl)) {
        Array.from(newEl.attributes).forEach(attr => {
          currEl.setAttribute(attr.name, attr.value);
        });
      }
    });
  };

  // clears the view
  _clear () {
    this.  _parentEl.innerHTML = "";
  }

  renderSpinner () {
    const html = `
    <div class="spinner">
      <svg>
        <use href="${icons}#icon-loader"></use>
      </svg>
    </div>`;

    this._clear();
    this.  _parentEl.insertAdjacentHTML("afterbegin", html);
  }

  renderError (message = this._errorMessage) {
    const html = `
      <div class="error">
        <div>
          <svg>
            <use href="${icons}#icon-alert-triangle"></use>
          </svg>
        </div>
        <p>${message}</p>
      </div>`;

    this._clear();
    this.  _parentEl.insertAdjacentHTML("afterbegin", html);
  }

  renderMessage (message = this._successMessage) {
    const html = `
      <div class="message">
        <div>
          <svg>
            <use href="${icons}#icon-smile"></use>
          </svg>
        </div>
        <p>${message}</p>
      </div>`;

    this._clear();
    this.  _parentEl.insertAdjacentHTML("afterbegin", html);
  }
}