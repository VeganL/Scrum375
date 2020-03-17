document.getElementById("hamburger").addEventListener("click", function (event) {
    var dropdown = document.getElementById("dropdown");
    if (dropdown.hidden) {
        dropdown.hidden = false;
    } else {
        dropdown.hidden = true;
    }
});
