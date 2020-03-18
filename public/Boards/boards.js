document.getElementById("hamburger").addEventListener("click", function (event) {
    var dropdown = document.getElementById("dropdown");
    if (dropdown.hidden) {
        dropdown.hidden = false;
    } else {
        dropdown.hidden = true;
    }
});

document.getElementById("boardArea").addEventListener("click", function (event) {
    console.log(event.currentTarget.id);
    console.log(event.target.id);
    if (event.target === event.currentTarget) {
        console.log("target == currentTarget");
    } else {
        console.log("target != currentTarget");
    }
	var target = event.target;
	if (target === event.currentTarget) {
		return;
	} else if (target.id != "boardcardcontent") {
		target = target.parentElement;
	}
	let board_id = target.lastChild.innerHTML;
	loadTasks(board_id);
});

document.getElementById("createBoard").addEventListener("click", function (event) {
    let boardArea = document.getElementById('boardArea');

});

var createwindow = document.getElementById("create-window");

document.getElementById("createBoard").addEventListener("click", function (event) {
    createwindow.style.display = "block";
});

document.getElementById("close").addEventListener("click", function (event) {
    createwindow.style.display = "none";
});

window.onclick = function (event) {
    if (event.target == createwindow) {
        createwindow.style.display = "none";
    }
}

function validateForm() {
    let boardName = document.getElementById("boardName");
    let formErrors = document.getElementById("formErrors");
    let nameValid = false;
    let errorMsg = '<ul>';

    if (boardName.value.length > 0) {
        boardName.style.border = "1px solid #aaa";
        nameValid = true;
    } else {
        boardName.style.border = "2px solid red";
        errorMsg += '<li>Missing Board name.</li>';
    }

    errorMsg += '</ul>';

    if (nameValid) {
        formErrors.style.display = "none";
        return true;
    } else {
        formErrors.innerHTML = errorMsg;
        formErrors.style.display = "block";
        return false;
    }
}

function registerResponseReceivedHandler() {
    console.log(this.responseText);
    if (this.responseText != '"Unable to create board."') {
        let response = JSON.parse(this.responseText);
        localStorage.setItem("boardIds", response.board_ids);
        window.location.href = "../Boards/";
    } else {
        let errorMsg = '<ul><li>' + this.responseText + '</li></ul>';
        let formErrors = document.getElementById("formErrors");
        formErrors.innerHTML = errorMsg;
        formErrors.style.display = "block";
    }
}

// Create board.
document.getElementById("submit").addEventListener("click", function (event) {
    // Prevent default form action. DO NOT REMOVE THIS LINE
    event.preventDefault();

    if (!validateForm())
        return;

    let ownerId = localStorage.getItem('userId');
    let boardName = document.getElementById("boardName").value;
    //let users = document.getElementById("users").value;

    let xmlHttp = new XMLHttpRequest();
    let requestURL = "http://scrum375.lroy.us/insertboard"
    xmlHttp.addEventListener("load", registerResponseReceivedHandler);
    xmlHttp.open("POST", requestURL);
    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xmlHttp.send("owner_id=" + ownerId + "&board_name=" + boardName);
});

document.addEventListener('readystatechange', event => {
    if (event.target.readyState !== "interactive"
        && event.target.readyState !== "complete") {
        return;
    } else {
        getBoards();
    }
});


function loadTasks(board_id)
{
    //save board Id depending on which board was hit
    window.location.href = "../Tasks/index.html";
}

function getBoards() {
    let boardIds = localStorage.getItem('boardIds');
    if (boardIds !== null) {
        let xmlHttp = new XMLHttpRequest();
        let requestURL = "http://scrum375.lroy.us/getboards";

        xmlHttp.addEventListener("load", function () {
            let boardsArr = JSON.parse(this.responseText);
            let boardArea = document.getElementById('boardArea');
            let boardAreaStr = '';

            for (var i = 0; i < boardsArr.length; i++) {
                let board = JSON.parse(boardsArr[i].board_data);

                let modDate = new Date(board.date_modified);
                let createDate = new Date(board.date_created);

                let modDateStr = modDate.toString().substring(4, 10) + ', ' + modDate.toString().substring(11, 15);
                let createDateStr = createDate.toString().substring(4, 10) + ', ' + createDate.toString().substring(11, 15);

                boardAreaStr += '<div class="board-card" onclick="loadTasks()"><div class="board-card-content"><h3>' + board.board_name + '</h3><p id="lastModified">Last modified: ' + modDateStr + '</p><p id="dateCreated">Created on: ' + createDateStr + '</p><p id="numMembers">Members: ' + String(board.member_amt) + '</p><p id="numTasks">Tasks: ' + String(board.task_amt) + '</p><p id="board_id" hidden>' + boardsArr[i].board_id + '</p></div></div>';
            }

            boardArea.innerHTML = boardAreaStr;
            sortBoards();
        });

        xmlHttp.open("POST", requestURL);
        xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xmlHttp.send("board_ids=" + boardIds);
    }
}

function populateBoardArea(boardsArr) {
    let boardArea = document.getElementById('boardArea');
    let boardAreaStr = '';
    for (var i = 0; i < boardsArr.length; i++) {
        let board = boardsArr[i];
        boardAreaStr += '<div class="board-card">' + board.innerHTML + '</div>';
    }
    boardArea.innerHTML = boardAreaStr;
}

function sortBoards() {
    let sortBy = document.getElementById("sortBy").value;
    let boardsArr = Array.from(document.getElementsByClassName("board-card"));

    switch (sortBy) {
        case "lastModified":
            boardsArr.sort(compareLastModified);
            break;
        case "dateCreated":
            boardsArr.sort(compareDateCreated);
            break;
        case "numMembers":
            boardsArr.sort(compareNumMembers);
            break;
        case "numTasks":
            boardsArr.sort(compareNumTasks);
            break;
    }
    populateBoardArea(boardsArr);
}
function compareLastModified(a, b) {
    return compareDates(a.querySelector("#lastModified").textContent.substring(15), b.querySelector("#lastModified").textContent.substring(15));
}
function compareDateCreated(a, b) {
    return compareDates(a.querySelector("#dateCreated").textContent.substring(12), b.querySelector("#dateCreated").textContent.substring(12));
}
function compareNumMembers(a, b) {
    return compareNums(a.querySelector("#numMembers").textContent.substring(9), b.querySelector("#numMembers").textContent.substring(9));
}
function compareNumTasks(a, b) {
    return compareNums(a.querySelector("#numTasks").textContent.substring(7), b.querySelector("#numTasks").textContent.substring(7));
}

function compareDates(date1, date2) {
    //get years
    let year1 = parseInt(date1.substring(7));
    let year2 = parseInt(date2.substring(7));
    if (year1 > year2) {
        return -1;
    }
    if (year1 < year2) {
        return 1;
    }

    //get months if years are equal
    let month1 = 0;
    switch (date1.substring(0, 3)) {
        case "Jan":
            month1 = 1;
            break;
        case "Feb":
            month1 = 2;
            break;
        case "Mar":
            month1 = 3;
            break;
        case "Apr":
            month1 = 4;
            break;
        case "May":
            month1 = 5;
            break;
        case "Jun":
            month1 = 6;
            break;
        case "Jul":
            month1 = 7;
            break;
        case "Aug":
            month1 = 8;
            break;
        case "Sep":
            month1 = 9;
            break;
        case "Oct":
            month1 = 10;
            break;
        case "Nov":
            month1 = 11;
            break;
        case "Dec":
            month1 = 12;
            break;
    }
    let month2 = 0;
    switch (date2.substring(0, 3)) {
        case "Jan":
            month2 = 1;
            break;
        case "Feb":
            month2 = 2;
            break;
        case "Mar":
            month2 = 3;
            break;
        case "Apr":
            month2 = 4;
            break;
        case "May":
            month2 = 5;
            break;
        case "Jun":
            month2 = 6;
            break;
        case "Jul":
            month2 = 7;
            break;
        case "Aug":
            month2 = 8;
            break;
        case "Sep":
            month2 = 9;
            break;
        case "Oct":
            month2 = 10;
            break;
        case "Nov":
            month2 = 11;
            break;
        case "Dec":
            month2 = 12;
            break;
    }
    if (month1 > month2) {
        return -1;
    }
    if (month1 < month2) {
        return 1;
    }

    //get days if months are equal
    let day1 = parseInt(date1.substring(4, 6));
    let day2 = parseInt(date2.substring(4, 6));
    if (day1 > day2) {
        return -1;
    }
    if (day1 < day2) {
        return 1
    }
    return 0;
}

function compareNums(num1, num2) {
    return num2 - num1;
}

