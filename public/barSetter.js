window.onload = function () {
    let dropDownArea = document.getElementById('dropdown');
    let sideBarArea = document.getElementsByClassName('sidebar');

    if (localStorage.getItem('username') !== null) {
        let dropDownStr = '<a href="../Boards/">Manage</a><a href="../Profile/' + username + '">Profile</a><a href="../About/">About</a>';
        let sideBarStr = '<div class="vertical-center" style="text-align: center;"><h1 id="header-firstline">scrum</h1><h1 id="header-secondline">375</h1><a href="../Boards/">Manage</a><a href="../Profile/">Profile</a><a href="../About/">About</a></div>';

        dropDownArea.innerHTML = dropDownStr;
        sideBarArea.innerHTML = sideBarStr;
    } else {
        let dropDownStr = '<a href="../Register/">Register</a><a href="../Login/">Login</a><a href="../About/">About</a>';
        let sideBarStr = '<div class="vertical-center" style="text-align: center;"><h1 id="header-firstline">scrum</h1><h1 id="header-secondline">375</h1><a href="../Register/">Register</a><a href="../Login/">Login</a><a href="../About/">About</a></div>';

        dropDownArea.innerHTML = dropDownStr;
        sideBarArea.innerHTML = sideBarStr;
    }
};