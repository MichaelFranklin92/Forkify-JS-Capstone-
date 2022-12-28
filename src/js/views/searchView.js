class SearchView {
  #parentEl = document.querySelector(".search");

  getQuery() {
    const query = this.#parentEl.querySelector(".search__field").value;
    this.#clearInput();
    return query;
  }

  // clears the search input field
  #clearInput() {
    this.#parentEl.querySelector(".search__field").value = "";
  }

  addSearchHandler(handler) {
    this.#parentEl.addEventListener("submit", function(event) {
      // prevent page reloading
      event.preventDefault();

      // call handler
      handler();
    })
  }
}

export default new SearchView();