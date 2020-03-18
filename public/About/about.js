document.getElementById("hamburger").addEventListener("click", function (event) {
    var dropdown = document.getElementById("dropdown");
    if (dropdown.hidden) {
        dropdown.hidden = false;
    } else {
        dropdown.hidden = true;
    }
});

if (localStorage.getItem('username') !== null) {
    document.getElementById('bars').innerHTML = '<div class="topbar"><h1>scrum375</h1><div id="dropdown" hidden><a href="../Boards/">Manage</a><a href="../Profile/' + localStorage.getItem('username') + '">Profile</a><a href="../About/">About</a></div><i id="hamburger" class="icon fa fa-bars"></i></div><div class="sidebar"><div class="vertical-center" style="text-align: center;"><h1 id="header-firstline">scrum</h1><h1 id="header-secondline">375</h1><a href="../Boards/">Manage</a><a href="../Profile/' + localStorage.getItem('username') + '">Profile</a><a href="../About/">About</a></div></div>';
}