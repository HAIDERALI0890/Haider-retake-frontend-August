// Homepage JavaScript - Books & Beyond
// This file adds a dynamic reader message and a small featured link strip.

document.addEventListener("DOMContentLoaded", () => {
    // Homepage message element
    const readerMessage = document.querySelector("#homepage-reader-message");

    // Featured link elements
    const featuredBookLink = document.querySelector("#featured-book-link");
    const featuredEventLink = document.querySelector("#featured-event-link");
    const featuredAccessoryLink = document.querySelector("#featured-accessory-link");

    // Stop the script if the Explore section message is not available
    if (!readerMessage) {
        return;
    }

    // Time-based reader messages
    const readerMessages = {
        morning: "Start your day by choosing where your next story begins.",
        afternoon: "Take a short break and choose where you would like to explore next.",
        evening: "Settle in for the evening and choose your next cozy stop."
    };

    // Featured homepage link text
    const featuredLinks = {
        book: "This Month’s Cozy Pick",
        event: "Reading Club Evening",
        accessory: "Floral Bookmark Set"
    };

    // Current time
    const currentHour = new Date().getHours();

    // Display time-based message
    if (currentHour < 12) {
        readerMessage.textContent = readerMessages.morning;
    } else if (currentHour < 18) {
        readerMessage.textContent = readerMessages.afternoon;
    } else {
        readerMessage.textContent = readerMessages.evening;
    }

    // Display featured link text
    updateFeaturedLink(featuredBookLink, `Book of the Month: ${featuredLinks.book}`);
    updateFeaturedLink(featuredEventLink, `Upcoming Event: ${featuredLinks.event}`);
    updateFeaturedLink(featuredAccessoryLink, `Reader Favorite: ${featuredLinks.accessory}`);

    // Featured link display
    function updateFeaturedLink(linkElement, text) {
        if (!linkElement) {
            return;
        }

        linkElement.textContent = text;
    }
});
