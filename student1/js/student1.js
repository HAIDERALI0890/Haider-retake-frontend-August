/*
 * student1.js — JavaScript for Haider Ali (R0960013)
 * Class: ACS01
 * Pages: student1page1.html (Book Selection) & student1page2.html (Book Recommendation)
 *
 * Contents:
 *  1. GET request 1 — fetchAllBooks()       → loads all books from the API onto page 1
 *  2. GET request 2 — fetchBookDetail()     → loads a single book by ?id= onto page 2
 *  3. POST request  — submitBookSuggestion()→ submits the "Suggest a Book" form on page 1
 *  4. EXTRA feature — filterAndSortBooks()  → live search + sort on the book grid (page 1)
 */

// ─── Base URL for the Vercel API ────────────────────────────────────────────
// All fetch() calls use this constant, so we only need to change it in one place.
const API_BASE = "https://books-and-beyond-2025.vercel.app";


/* ============================================================
   1. GET REQUEST 1 — fetchAllBooks()
   Fetches all books from GET /student1/books and renders
   them as cards inside #api-books-container on page 1.
   ============================================================ */

// allBooks holds every book returned by the API.
// filterAndSortBooks() re-reads this array when the user types or sorts.
let allBooks = [];

async function fetchAllBooks() {
    // Elements we'll show/hide depending on loading state
    const loadingEl = document.getElementById("books-loading");
    const errorEl = document.getElementById("books-error");
    const container = document.getElementById("api-books-container");

    // Guard: if none of these elements exist we are not on page 1 — do nothing.
    if (!loadingEl || !errorEl || !container) return;

    // Show the spinner, hide any previous error
    loadingEl.classList.remove("d-none");
    errorEl.classList.add("d-none");
    container.innerHTML = "";

    try {
        // fetch() sends an HTTP GET request to the Vercel API
        const response = await fetch(`${API_BASE}/student1/books`);

        // If the server replied with an error status (4xx / 5xx), throw so catch handles it
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        // Parse the JSON body — our API returns { "books": [...] }
        const data = await response.json();

        // Store in the module-level array so the search/sort feature can use it
        allBooks = data.books || [];

        // Render the books for the first time (no filter, no sort)
        filterAndSortBooks();

    } catch (error) {
        // Something went wrong — show the error banner
        errorEl.classList.remove("d-none");
        console.error("fetchAllBooks error:", error);
    } finally {
        // Always hide the spinner, whether we succeeded or failed
        loadingEl.classList.add("d-none");
    }
}


/* ============================================================
   HELPER — buildBookCard(book)
   Returns an HTML string for one book card.
   Called by filterAndSortBooks() for every book in the list.
   ============================================================ */

function buildBookCard(book) {
    // Use a placeholder emoji when the book has no cover image URL
    const imageHtml = book.image_url
        ? `<img class="api-book-img" src="${book.image_url}" alt="${book.title} cover">`
        : `<div class="api-book-img-placeholder">📖</div>`;

    // Format price: show "Free" when price is 0 or missing
    const priceText = book.price ? `$${parseFloat(book.price).toFixed(2)}` : "Free";

    // Link to page 2 with ?id= so fetchBookDetail() can load this specific book
    const detailUrl = `student1page2.html?id=${book.id}`;

    return `
    <div class="col">
      <div class="api-book-card">
        ${imageHtml}
        <div class="api-book-body">
          <p class="api-book-title">${book.title}</p>
          <p class="api-book-author">by ${book.author}</p>
          <p class="api-book-category">${book.category || "General"}</p>
          <p class="api-book-price">${priceText}</p>
          <a href="${detailUrl}" class="btn-detail">View Details</a>
        </div>
      </div>
    </div>`;
}


/* ============================================================
   4. EXTRA FEATURE — filterAndSortBooks()
   Reads the search input and sort dropdown, then re-renders
   the book grid with only the matching / sorted books.
   Called on every keystroke and every sort change.
   ============================================================ */

function filterAndSortBooks() {
    const container = document.getElementById("api-books-container");
    const noResultsMsg = document.getElementById("no-results-msg");
    const searchInput = document.getElementById("search-input");
    const sortSelect = document.getElementById("sort-select");

    if (!container) return;

    // Read current search term (lowercase for case-insensitive comparison)
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";

    // Filter: keep books whose title OR author contains the search term
    let filtered = allBooks.filter(book => {
        const title = (book.title || "").toLowerCase();
        const author = (book.author || "").toLowerCase();
        return title.includes(searchTerm) || author.includes(searchTerm);
    });

    // Sort: apply the selected sort option to the filtered list
    const sortValue = sortSelect ? sortSelect.value : "default";

    if (sortValue === "title-asc") {
        // A → Z by title
        filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortValue === "title-desc") {
        // Z → A by title
        filtered.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortValue === "price-asc") {
        // Cheapest first
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortValue === "price-desc") {
        // Most expensive first
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    }
    // "default" — keep the original API order (no extra sort needed)

    // Render the filtered + sorted cards
    container.innerHTML = filtered.map(buildBookCard).join("");

    // Show or hide the "no results" message
    if (noResultsMsg) {
        if (filtered.length === 0) {
            noResultsMsg.classList.remove("d-none");
        } else {
            noResultsMsg.classList.add("d-none");
        }
    }
}


/* ============================================================
   2. GET REQUEST 2 — fetchBookDetail()
   Reads ?id= from the URL, then fetches that single book from
   GET /student1/books?id=<id> and renders it on page 2.
   ============================================================ */

async function fetchBookDetail() {
    const wrap = document.getElementById("book-detail-wrap");

    // Guard: if this element doesn't exist we are not on page 2 — do nothing.
    if (!wrap) return;

    // Read the loading and error elements
    const loadingEl = document.getElementById("book-detail-loading");
    const errorEl = document.getElementById("book-detail-error");

    // Show spinner
    if (loadingEl) loadingEl.classList.remove("d-none");
    if (errorEl) errorEl.classList.add("d-none");
    wrap.innerHTML = "";

    // Get the book id from the URL query string (?id=3)
    const params = new URLSearchParams(window.location.search);
    const bookId = params.get("id");

    // If there is no ?id= in the URL, show a friendly error
    if (!bookId) {
        if (errorEl) {
            errorEl.textContent = "No book selected. Please go back to the selection page.";
            errorEl.classList.remove("d-none");
        }
        if (loadingEl) loadingEl.classList.add("d-none");
        return;
    }

    try {
        // Fetch the single book from the API using a query parameter (?id=)
        const response = await fetch(`${API_BASE}/student1/books?id=${bookId}`);

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        // The API returns { "book": { id, title, author, ... } }
        const data = await response.json();
        const book = data.book;

        // Format price
        const priceText = book.price ? `$${parseFloat(book.price).toFixed(2)}` : "Free";

        // Build star rating display (filled ★ vs empty ☆)
        const rating = Math.round(book.rating || 0);
        const starsHtml = "★".repeat(rating) + "☆".repeat(5 - rating);

        // Build the cover image or a placeholder
        const coverHtml = book.image_url
            ? `<img src="${book.image_url}" alt="${book.title} cover" class="book-main-img shadow-sm rounded">`
            : `<div class="api-book-img-placeholder" style="height:300px;font-size:5rem;">📖</div>`;

        // Inject the complete book detail HTML into the page
        wrap.innerHTML = `
      <div class="featured-book-wrap">
        <div class="row align-items-start g-4">
 
          <!-- Cover image -->
          <div class="col-md-4 text-center">
            ${coverHtml}
          </div>
 
          <!-- Book details -->
          <div class="col-md-8">
            <h1 class="fw-bold h2">${book.title}</h1>
            <p class="text-muted">
              by <span class="book-author-link">${book.author}</span>
            </p>
 
            <!-- Star rating -->
            <div class="mb-2">
              <span class="text-warning">${starsHtml}</span>
              <span class="ratings-count small ms-2">
                ${book.reviews_count || 0} ratings
              </span>
            </div>
 
            <hr>
 
            <!-- Price -->
            <p class="book-price h4">${priceText}</p>
 
            <!-- Category badge -->
            <p>
              <span class="badge bg-secondary">${book.category || "General"}</span>
            </p>
 
            <!-- Description -->
            <p class="mt-3">
              <strong>Description:</strong>
              ${book.description || "No description available."}
            </p>
 
            <!-- Action buttons styled with site branding -->
            <div class="mt-4 d-flex gap-2 flex-wrap">
              <button class="btn btn-submit px-4 fw-bold">Add to Cart</button>
              <button class="btn btn-outline-secondary px-4">Save for Later</button>
              <a href="student1page1.html" class="btn btn-outline-secondary px-4">
                ← Back to Selection
              </a>
            </div>
          </div>
 
        </div>
      </div>`;

    } catch (error) {
        if (errorEl) {
            errorEl.textContent = "Could not load book details. Please try again later.";
            errorEl.classList.remove("d-none");
        }
        console.error("fetchBookDetail error:", error);
    } finally {
        if (loadingEl) loadingEl.classList.add("d-none");
    }
}


/* ============================================================
   3. POST REQUEST — submitBookSuggestion()
   Reads the "Suggest a Book" form on page 1 and sends a
   POST request to /student1/books with the form data.
   Shows success or error feedback to the user.
   ============================================================ */

async function submitBookSuggestion(event) {
    // Prevent the default browser form submission (page reload)
    event.preventDefault();

    const successEl = document.getElementById("suggest-success");
    const errorEl = document.getElementById("suggest-error");
    const submitBtn = document.getElementById("suggest-submit-btn");

    // Hide previous feedback banners
    if (successEl) successEl.classList.add("d-none");
    if (errorEl) errorEl.classList.add("d-none");

    // Disable the button while the request is in progress
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting…";
    }

    // Read each field by name — we NEVER use a generic dump to avoid field-order issues
    const title = document.getElementById("book-title").value.trim();
    const author = document.getElementById("book-author").value.trim();
    const category = document.getElementById("book-category").value;
    const price = parseFloat(document.getElementById("book-price").value) || 0;
    const imageUrl = document.getElementById("book-image").value.trim();
    const description = document.getElementById("book-description").value.trim();

    // Simple client-side validation — title and author are required
    if (!title || !author) {
        if (errorEl) {
            errorEl.textContent = "Please fill in at least the title and author.";
            errorEl.classList.remove("d-none");
        }
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Submit Suggestion";
        }
        return;
    }

    // Build the request body as a JavaScript object matching BookCreate model
    const bookData = {
        title: title,
        author: author,
        category: category || "Other",
        price: price,
        description: description,
        image_url: imageUrl || null,
        rating: 0,       // new suggestions start with no rating
        reviews_count: 0        // new suggestions start with no reviews
    };

    try {
        // Send the POST request with JSON body
        const response = await fetch(`${API_BASE}/student1/books`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            // JSON.stringify converts the JS object to a JSON string
            body: JSON.stringify(bookData)
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        // Success — show the green banner and reset the form
        if (successEl) successEl.classList.remove("d-none");
        document.getElementById("suggest-book-form").reset();

        // Refresh the book list so the new book appears immediately
        await fetchAllBooks();

    } catch (error) {
        // Show the red error banner
        if (errorEl) {
            errorEl.textContent = "Something went wrong. Please check your details and try again.";
            errorEl.classList.remove("d-none");
        }
        console.error("submitBookSuggestion error:", error);
    } finally {
        // Always re-enable the submit button
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Submit Suggestion";
        }
    }
}


/* ============================================================
   PAGE INITIALISATION
   Runs once the HTML is fully loaded (DOMContentLoaded).
   Decides which page we are on and attaches the right events.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    /* ── PAGE 1: Book Selection ── */
    const booksContainer = document.getElementById("api-books-container");
    if (booksContainer) {

        // Fetch all books as soon as page 1 loads
        fetchAllBooks();

        // Attach live-search: re-filter on every keystroke
        const searchInput = document.getElementById("search-input");
        if (searchInput) {
            searchInput.addEventListener("input", filterAndSortBooks);
        }

        // Attach sort: re-filter whenever the dropdown changes
        const sortSelect = document.getElementById("sort-select");
        if (sortSelect) {
            sortSelect.addEventListener("change", filterAndSortBooks);
        }

        // Attach POST form submission
        const suggestForm = document.getElementById("suggest-book-form");
        if (suggestForm) {
            suggestForm.addEventListener("submit", submitBookSuggestion);
        }
    }

    /* ── PAGE 2: Book Recommendation ── */
    const bookDetailWrap = document.getElementById("book-detail-wrap");
    if (bookDetailWrap) {
        // Fetch the specific book whose id is in the URL
        fetchBookDetail();
    }

});
