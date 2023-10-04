document.title = "It's Turin' Time!"

setUpDarkMode = () => {
    if(localStorage.getItem("darkMode") === "true") {
        toggleDarkMode();
        // Needs to be set to true again to override toggle
        localStorage.setItem("darkMode", true);
    }
}