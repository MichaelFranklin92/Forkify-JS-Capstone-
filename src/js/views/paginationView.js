import View from "./view";

import icons from 'url:../../img/icons.svg';

class PaginationView extends View {
  _parentEl = document.querySelector(".pagination");

  addHandlerClick(handler) {
    this._parentEl.addEventListener("click", function(event) {
      const btn = event.target.closest('.btn--inline');

      if (!btn) return;

      handler(Number(btn.dataset.goto));
    })
  }

  _generateMarkup() {
    const numPages = Math.ceil(this._data.results.length / this._data.resultsPerPage);
    const currentPage = this._data.page;

    // page 1, only next button
    if (currentPage === 1 && numPages > 1) {
      return this._generateButtonMarkup(currentPage);
    }
    // page 3, only back button
    if (currentPage === numPages && numPages > 1) {
      return this._generateButtonMarkup(currentPage, false);
    }
    // page 2, both buttons
    if (currentPage < numPages) {
      return `
      ${this._generateButtonMarkup(currentPage, false)}
      ${this._generateButtonMarkup(currentPage)}`;
    }
    // don't render buttons as we only have one page
    return "";
  };

  _generateButtonMarkup(currentPage, next = true) {
    if (next)
      return `
        <button data-goto="${currentPage + 1}" class="btn--inline pagination__btn--next">
          <span>Page ${currentPage + 1}</span>
          <svg class="search__icon">
            <use href="${icons}#icon-arrow-right"></use>
          </svg>
        </button>`;
    return `
      <button data-goto="${currentPage - 1}" class="btn--inline pagination__btn--prev">
        <svg class="search__icon">
          <use href="${icons}#icon-arrow-left"></use>
        </svg>
        <span>Page ${currentPage - 1}</span>
      </button>`;
  }
}

export default new PaginationView();