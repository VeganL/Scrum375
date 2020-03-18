let barArea = document.getElementById('bars');
let username = localStorage.getItem('username');

barArea.addEventListener('load', function () {
    if (username === null) {
        barArea.innerHTML = '<div class="topbar"><h1>scrum375</h1><div id="dropdown" hidden><a href="../Register/">Register</a><a href="../Login/">Login</a><a href="../About/">About</a></div><i id="hamburger" class="icon fa fa-bars"></i></div><div class="sidebar"><div class="vertical-center" style="text-align: center;"><h1 id="header-firstline">scrum</h1><h1 id="header-secondline">375</h1><a href="../Register/">Register</a><a href="../Login/">Login</a><a href="../About/">About</a></div></div>';
    } else {
        barArea.innerHTML = '<div class="topbar"><h1>scrum375</h1><div id="dropdown" hidden><a href="../Boards/">Manage</a><a href="../Profile/">Profile</a><a href="../About/">About</a></div><i id="hamburger" class="icon fa fa-bars"></i></div><div class="sidebar"><div class="vertical-center" style="text-align: center;"><h1 id="header-firstline">scrum</h1><h1 id="header-secondline">375</h1><a href="../Boards/">Manage</a><a href="../Profile/' + username + '">Profile</a><a href="../About/">About</a></div></div>';
    }
});