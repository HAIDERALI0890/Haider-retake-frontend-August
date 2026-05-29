// Student 3 JavaScript - Daria Kudrina
// This file contains the JavaScript for:
// - Book Accessories page
// - Blind Box page

const API_BASE_URL = "https://books-and-beyond-2025.vercel.app";

document.addEventListener("DOMContentLoaded", () => {
    // Book Accessories page elements
    const accessoryItems = document.querySelectorAll(".accessory-item");
    const categorySections = document.querySelectorAll(".accessory-category-section");

    const searchInput = document.querySelector("#accessory-search");
    const filterButtons = document.querySelectorAll(".accessory-filter-btn");
    const sortButtons = document.querySelectorAll(".accessory-sort-btn");

    const dropdownButton = document.querySelector("#accessory-filter-dropdown");
    const accessoryStatus = document.querySelector("#accessory-status");
    const accessoryCount = document.querySelector("#accessory-count");
    const filterSummary = document.querySelector("#filter-summary");

    const suggestionForm = document.querySelector("#accessory-suggestion-form");
    const suggestionStatus = document.querySelector("#suggestion-status");
    const suggestionSubmitButton = document.querySelector("#suggestion-submit-btn");

    // Blind Box page elements
    const blindBoxQuizForm = document.querySelector("#blind-box-quiz-form");
    const blindBoxProgress = document.querySelector("#blind-box-progress");
    const blindBoxQuestion = document.querySelector("#blind-box-question");
    const blindBoxOptions = document.querySelector("#blind-box-options");
    const blindBoxResult = document.querySelector("#blind-box-result");
    const quizBackButton = document.querySelector("#quiz-back-btn");
    const quizNextButton = document.querySelector("#quiz-next-btn");

    // Current accessory filter and sort settings
    let currentSearch = "";
    let currentCategory = "all";
    let currentSort = "default";

    // Current Blind Box quiz settings
    let currentQuizStep = 0;
    const quizAnswers = {};

    const blindBoxQuestions = [
        {
            key: "readingMood",
            question: "What are you feeling like reading?",
            options: [
                {
                    text: "Something soft, comforting, and peaceful",
                    value: "cozy"
                },
                {
                    text: "Something tense, mysterious, and dramatic",
                    value: "dark"
                },
                {
                    text: "Something adventurous, magical, and imaginative",
                    value: "magical"
                },
                {
                    text: "Something emotional, warm, and character-focused",
                    value: "heartfelt"
                }
            ]
        },
        {
            key: "readingAnimal",
            question: "Which animal best represents your reading mood?",
            options: [
                {
                    text: "A cat curled up by the window",
                    value: "cozy"
                },
                {
                    text: "A raven watching from a rooftop",
                    value: "dark"
                },
                {
                    text: "A fox running through an enchanted forest",
                    value: "magical"
                },
                {
                    text: "A deer standing quietly in the woods",
                    value: "heartfelt"
                }
            ]
        },
        {
            key: "readingPlace",
            question: "Pick your ideal reading setting",
            options: [
                {
                    text: "A rainy afternoon with tea and a blanket",
                    value: "cozy"
                },
                {
                    text: "A candlelit room at midnight",
                    value: "dark"
                },
                {
                    text: "A hidden library in a castle",
                    value: "magical"
                },
                {
                    text: "A quiet garden during golden hour",
                    value: "heartfelt"
                }
            ]
        },
        {
            key: "readingEnding",
            question: "What kind of ending do you usually like?",
            options: [
                {
                    text: "Warm and comforting",
                    value: "cozy"
                },
                {
                    text: "Shocking and unexpected",
                    value: "dark"
                },
                {
                    text: "Epic and magical",
                    value: "magical"
                },
                {
                    text: "Emotional and meaningful",
                    value: "heartfelt"
                }
            ]
        }
    ];

    // Save the original card order so the default sorting option can restore the layout
    accessoryItems.forEach((item, index) => {
        item.dataset.originalOrder = index;
    });

    // Initial setup for Book Accessories page
    if (accessoryItems.length > 0) {
        loadAccessoryAvailability();
        updatePageDisplay();
    }

    // Initial setup for Blind Box page
    if (blindBoxQuizForm) {
        renderBlindBoxQuestion();
    }

    // Search bar
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            currentSearch = searchInput.value.toLowerCase().trim();
            updatePageDisplay();
        });
    }

    // Category filter buttons in the Bootstrap dropdown
    filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            currentCategory = button.dataset.category;

            updateActiveButton(filterButtons, button);
            updatePageDisplay();

            // Second GET request for the assignment
            loadFilteredAccessories(currentCategory);
        });
    });

    // Price sorting buttons in the Bootstrap dropdown
    sortButtons.forEach((button) => {
        button.addEventListener("click", () => {
            currentSort = button.dataset.sort;

            updateActiveButton(sortButtons, button);
            updatePageDisplay();
        });
    });

    // Accessory suggestion form
    if (suggestionForm) {
        suggestionForm.addEventListener("submit", submitAccessorySuggestion);
    }

    // Blind Box quiz navigation
    if (quizBackButton) {
        quizBackButton.addEventListener("click", goToPreviousQuizQuestion);
    }

    if (quizNextButton) {
        quizNextButton.addEventListener("click", goToNextQuizQuestion);
    }

    if (blindBoxResult) {
        blindBoxResult.addEventListener("click", (event) => {
            if (event.target.id === "retake-quiz-btn") {
                retakeBlindBoxQuiz();
            }
        });
    }

    // Main display update for search, filter, sort and text feedback
    function updatePageDisplay() {
        sortAccessoryCards();
        updateVisibleAccessories();
        updateFilterSummary();
        updateDropdownText();
    }

    // Search and category filtering
    function updateVisibleAccessories() {
        let visibleCount = 0;

        accessoryItems.forEach((item) => {
            const itemName = item.dataset.name.toLowerCase();
            const itemCategory = item.dataset.category.toLowerCase();

            const matchesSearch = itemName.includes(currentSearch);
            const matchesCategory = currentCategory === "all" || itemCategory === currentCategory;

            if (matchesSearch && matchesCategory) {
                item.classList.remove("d-none");
                visibleCount++;
            } else {
                item.classList.add("d-none");
            }
        });

        updateCategorySections();
        updateAccessoryCount(visibleCount);
    }

    // Hide full category sections when none of their cards are visible
    function updateCategorySections() {
        categorySections.forEach((section) => {
            const visibleItems = section.querySelectorAll(".accessory-item:not(.d-none)");
            const sectionCategory = section.dataset.category;

            const matchesSelectedCategory = currentCategory === "all" || currentCategory === sectionCategory;

            if (matchesSelectedCategory && visibleItems.length > 0) {
                section.classList.remove("d-none");
            } else {
                section.classList.add("d-none");
            }
        });
    }

    // Price sorting
    function sortAccessoryCards() {
        const productRows = document.querySelectorAll(
            "#bookmark-products .row, #sleeve-products .row, #tote-products .row"
        );

        productRows.forEach((row) => {
            const sortedItems = Array.from(row.querySelectorAll(".accessory-item"));

            sortedItems.sort((firstItem, secondItem) => {
                const firstPrice = Number(firstItem.dataset.price);
                const secondPrice = Number(secondItem.dataset.price);

                if (currentSort === "price-low") {
                    return firstPrice - secondPrice;
                }

                if (currentSort === "price-high") {
                    return secondPrice - firstPrice;
                }

                return Number(firstItem.dataset.originalOrder) - Number(secondItem.dataset.originalOrder);
            });

            sortedItems.forEach((item) => {
                row.appendChild(item);
            });
        });
    }

    // Product count text
    function updateAccessoryCount(visibleCount) {
        if (!accessoryCount) {
            return;
        }

        if (visibleCount === 0) {
            accessoryCount.textContent = "No accessories match your search.";
        } else if (visibleCount === 1) {
            accessoryCount.textContent = "Showing 1 accessory";
        } else {
            accessoryCount.textContent = `Showing ${visibleCount} accessories`;
        }
    }

    // Filter summary text below the controls
    function updateFilterSummary() {
        if (!filterSummary) {
            return;
        }

        const categoryText = formatCategoryName(currentCategory).toLowerCase();
        const sortText = formatSortName(currentSort).toLowerCase();

        if (currentSearch) {
            filterSummary.textContent = `Showing ${categoryText}, sorted by ${sortText}, matching "${currentSearch}".`;
        } else {
            filterSummary.textContent = `Showing ${categoryText}, sorted by ${sortText}.`;
        }
    }

    // Dropdown button text
    function updateDropdownText() {
        if (!dropdownButton) {
            return;
        }

        const categoryText = formatCategoryName(currentCategory);
        const sortText = formatSortName(currentSort);

        dropdownButton.textContent = `${categoryText} • ${sortText}`;
    }

    // Active dropdown button styling
    function updateActiveButton(buttons, selectedButton) {
        buttons.forEach((button) => {
            button.classList.remove("active");
        });

        selectedButton.classList.add("active");
    }

    // First GET request: load all accessories for availability badges
    async function loadAccessoryAvailability() {
        showStatus(accessoryStatus, "info", "Checking live accessory availability...");

        try {
            const response = await fetch(`${API_BASE_URL}/accessories`);

            if (!response.ok) {
                throw new Error("Could not load accessories.");
            }

            const data = await response.json();
            const accessories = getArrayFromApiResponse(data);

            addAvailabilityBadges(accessories);

            showStatus(accessoryStatus, "success", "Live availability loaded successfully.");
        } catch (error) {
            showStatus(
                accessoryStatus,
                "warning",
                "Live availability could not be loaded right now. You can still browse the collection."
            );
        }
    }

    // Second GET request: check API data for the selected category
    async function loadFilteredAccessories(category) {
        const categoryText = formatCategoryName(category);

        let endpoint = `${API_BASE_URL}/accessories`;

        if (category !== "all") {
            endpoint = `${API_BASE_URL}/accessories/filter?category=${encodeURIComponent(category)}`;
        }

        showStatus(accessoryStatus, "info", `${categoryText} filter applied. Checking live API data...`);

        try {
            const response = await fetch(endpoint);

            if (!response.ok) {
                throw new Error("Could not load filtered accessories.");
            }

            const data = await response.json();
            const accessories = getArrayFromApiResponse(data);

            showStatus(
                accessoryStatus,
                "success",
                `${categoryText} filter applied. ${accessories.length} item(s) found in the live API.`
            );
        } catch (error) {
            showStatus(
                accessoryStatus,
                "warning",
                `${categoryText} filter applied on the page. The live API category count could not be checked right now.`
            );
        }
    }

    // Availability badges
    function addAvailabilityBadges(apiAccessories) {
        accessoryItems.forEach((item, index) => {
            const title = item.querySelector(".card-title");

            if (!title) {
                return;
            }

            const existingBadge = item.querySelector(".availability-badge");

            if (existingBadge) {
                existingBadge.remove();
            }

            const badge = document.createElement("span");
            badge.classList.add("badge", "availability-badge", "mb-2");

            const itemExistsInApi = apiAccessories.some((accessory) => {
                return normalizeText(accessory.name) === normalizeText(item.dataset.name);
            });

            if (!itemExistsInApi && apiAccessories.length > 0) {
                badge.classList.add("text-bg-secondary");
                badge.textContent = "Check in store";
            } else if (index % 3 === 0) {
                badge.classList.add("text-bg-success");
                badge.textContent = "In stock";
            } else if (index % 3 === 1) {
                badge.classList.add("text-bg-warning");
                badge.textContent = "Low stock";
            } else {
                badge.classList.add("text-bg-primary");
                badge.textContent = "Available online";
            }

            title.insertAdjacentElement("afterend", badge);
        });
    }

    // POST request: submit an accessory suggestion
    async function submitAccessorySuggestion(event) {
        event.preventDefault();

        const nameInput = document.querySelector("#suggestion-name");
        const categoryInput = document.querySelector("#suggestion-category");
        const priceInput = document.querySelector("#suggestion-price");
        const imageInput = document.querySelector("#suggestion-image");
        const descriptionInput = document.querySelector("#suggestion-description");

        const newAccessory = {
            name: nameInput.value.trim(),
            category: categoryInput.value,
            price: Number(priceInput.value),
            image_url: getImageValue(imageInput),
            description: descriptionInput.value.trim()
        };

        showStatus(suggestionStatus, "info", "Sending your accessory suggestion...");

        if (suggestionSubmitButton) {
            suggestionSubmitButton.disabled = true;
            suggestionSubmitButton.textContent = "Sending...";
        }

        try {
            const response = await fetch(`${API_BASE_URL}/accessories`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newAccessory)
            });

            if (!response.ok) {
                throw new Error("The suggestion could not be submitted.");
            }

            showStatus(suggestionStatus, "success", "Thank you! Your accessory suggestion was submitted successfully.");

            suggestionForm.reset();
            await loadAccessoryAvailability();
        } catch (error) {
            showStatus(
                suggestionStatus,
                "danger",
                "Something went wrong. Your suggestion could not be submitted right now."
            );
        } finally {
            if (suggestionSubmitButton) {
                suggestionSubmitButton.disabled = false;
                suggestionSubmitButton.textContent = "Send Suggestion";
            }
        }
    }

    // Render one Blind Box quiz question at a time
    function renderBlindBoxQuestion() {
        const currentQuestion = blindBoxQuestions[currentQuizStep];
        const savedAnswer = quizAnswers[currentQuestion.key];

        blindBoxProgress.textContent = `Question ${currentQuizStep + 1} of ${blindBoxQuestions.length}`;
        blindBoxQuestion.textContent = currentQuestion.question;

        blindBoxOptions.innerHTML = currentQuestion.options
            .map((option) => {
                const activeClass = savedAnswer === option.value ? "active" : "";

                return `
                    <button type="button" class="btn btn-outline-primary quiz-option ${activeClass}" data-value="${option.value}">
                        ${option.text}
                    </button>
                `;
            })
            .join("");

        blindBoxOptions.querySelectorAll(".quiz-option").forEach((button) => {
            button.addEventListener("click", () => {
                quizAnswers[currentQuestion.key] = button.dataset.value;

                blindBoxOptions.querySelectorAll(".quiz-option").forEach((optionButton) => {
                    optionButton.classList.remove("active");
                });

                button.classList.add("active");
            });
        });

        quizBackButton.disabled = currentQuizStep === 0;

        if (currentQuizStep === blindBoxQuestions.length - 1) {
            quizNextButton.textContent = "Reveal Match";
        } else {
            quizNextButton.textContent = "Next";
        }
    }

    // Go to previous quiz question
    function goToPreviousQuizQuestion() {
        if (currentQuizStep > 0) {
            currentQuizStep--;
            renderBlindBoxQuestion();
        }
    }

    // Go to next quiz question or show result
    function goToNextQuizQuestion() {
        if (currentQuizStep < blindBoxQuestions.length - 1) {
            currentQuizStep++;
            renderBlindBoxQuestion();
        } else {
            showBlindBoxResult();
        }
    }

    // Blind Box quiz result
    function showBlindBoxResult() {
        const selectedAnswers = Object.values(quizAnswers);

        if (selectedAnswers.length === 0) {
            blindBoxResult.innerHTML = `
                <div class="alert alert-warning" role="alert">
                    Pick at least one answer so we can suggest a blind box match. You can skip any questions you are unsure about.
                </div>
            `;
            return;
        }

        const scores = {
            cozy: 0,
            dark: 0,
            magical: 0,
            heartfelt: 0
        };

        selectedAnswers.forEach((answer) => {
            scores[answer]++;
        });

        const winningTheme = Object.keys(scores).reduce((highestTheme, currentTheme) => {
            if (scores[currentTheme] > scores[highestTheme]) {
                return currentTheme;
            }

            return highestTheme;
        });

        const result = getBlindBoxRecommendation(winningTheme);

        blindBoxResult.innerHTML = `
            <div class="alert alert-success" role="alert">
                <h3 class="h4">Your Blind Box Match</h3>
                <p class="mb-2">
                    You should pick the <strong>${result.bundle}</strong>.
                </p>
                <p class="mb-0">
                    ${result.description}
                </p>
            </div>

            <div class="card mt-3">
                <div class="card-body">
                    <h3 class="h5">Suggested accessory add-on</h3>
                    <p class="mb-2">
                        <strong>${result.accessory}</strong>
                    </p>
                    <p class="mb-0">
                        ${result.accessoryDescription}
                    </p>
                </div>
            </div>

            <button type="button" id="retake-quiz-btn" class="btn btn-outline-primary mt-3">
                Retake Quiz
            </button>
        `;
    }

    // Reset the Blind Box quiz
    function retakeBlindBoxQuiz() {
        currentQuizStep = 0;

        Object.keys(quizAnswers).forEach((answerKey) => {
            delete quizAnswers[answerKey];
        });

        blindBoxResult.innerHTML = "";
        renderBlindBoxQuestion();
    }

    // Blind Box quiz recommendation data
    function getBlindBoxRecommendation(theme) {
        const recommendations = {
            cozy: {
                bundle: "Cozy Escape Blind Box",
                description: "This bundle is best for readers who want something gentle, peaceful, and comforting.",
                accessory: "Quilted Travel Sleeve",
                accessoryDescription: "A padded book sleeve that keeps your current read safe when you carry it around."
            },
            dark: {
                bundle: "Dark & Twisty Blind Box",
                description: "This bundle is best for readers who enjoy secrets, suspense, and dramatic surprises.",
                accessory: "Vintage Reader Bookmark",
                accessoryDescription: "A classic bookmark that matches the old-book, mysterious atmosphere of this box."
            },
            magical: {
                bundle: "Magical Worlds Blind Box",
                description: "This bundle is best for readers who want fantasy settings, adventure, and imagination.",
                accessory: "Classic Reader Tote",
                accessoryDescription:
                    "A sturdy tote bag for carrying your next magical read, bookstore finds, or library haul."
            },
            heartfelt: {
                bundle: "Heartfelt Reads Blind Box",
                description:
                    "This bundle is best for readers who love emotional stories, memorable characters, and warm endings.",
                accessory: "Floral Bookmark Set",
                accessoryDescription:
                    "A soft floral bookmark set that fits the gentle and emotional feeling of this box."
            }
        };

        return recommendations[theme];
    }

    // Status messages
    function showStatus(element, type, message) {
        if (!element) {
            return;
        }

        element.innerHTML = `
            <div class="alert alert-${type} text-center mb-0" role="alert">
                ${message}
            </div>
        `;
    }

    // Form image fallback
    function getImageValue(imageInput) {
        if (!imageInput || imageInput.value.trim() === "") {
            return "img/accessory-placeholder.webp";
        }

        return imageInput.value.trim();
    }

    // Text cleanup for comparing names from the API and HTML
    function normalizeText(value) {
        return String(value).toLowerCase().replace("&", "and").replace(/\s+/g, " ").trim();
    }

    // Category display names
    function formatCategoryName(category) {
        if (category === "all") {
            return "All accessories";
        }

        if (category === "bookmark") {
            return "Bookmarks";
        }

        if (category === "book sleeve") {
            return "Book sleeves";
        }

        if (category === "tote bag") {
            return "Tote bags";
        }

        return "Accessories";
    }

    // Sort display names
    function formatSortName(sortValue) {
        if (sortValue === "price-low") {
            return "price low to high";
        }

        if (sortValue === "price-high") {
            return "price high to low";
        }

        return "default order";
    }

    // Allows the code to handle different possible API response formats
    function getArrayFromApiResponse(data) {
        if (Array.isArray(data)) {
            return data;
        }

        if (Array.isArray(data.accessories)) {
            return data.accessories;
        }

        if (Array.isArray(data.data)) {
            return data.data;
        }

        return [];
    }
});
