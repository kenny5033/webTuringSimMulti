document.title = "wikipedia.org/wiki/Turin"

setUpDarkMode = () => {
    if(localStorage.getItem("darkMode") === "true") {
        toggleDarkMode();
        // Needs to be set to true again to override toggle
        localStorage.setItem("darkMode", true);
    }
}

toggleDarkMode = () => {
    document.body.classList.toggle("darkMode");
    document.querySelector(".box").classList.toggle("boxDarkMode");
    if(localStorage.getItem("darkMode") === "true") {
        localStorage.setItem("darkMode", false);
    } else {
        localStorage.setItem("darkMode", true);
    }
}
