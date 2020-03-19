document.getElementById("hamburger").addEventListener("click", function (event) {
    var dropdown = document.getElementById("dropdown");
    if (dropdown.hidden) {
        dropdown.hidden = false;
    } else {
        dropdown.hidden = true;
    }
});

document.getElementById("createTask").addEventListener("click", function (event) {
    let boardArea = document.getElementById('taskArea');

});

var createwindow = document.getElementById("create-window");

document.getElementById("createTask").addEventListener("click", function (event) {
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
    let taskName = document.getElementById("taskName");
    let formErrors = document.getElementById("formErrors");
    let nameValid = false;
    let errorMsg = '<ul>';

    if (taskName.value.length > 0) {
        taskName.style.border = "1px solid #aaa";
        nameValid = true;
    } else {
        taskName.style.border = "2px solid red";
        errorMsg += '<li>Missing Task name.</li>';
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
    if (this.responseText != '"Unable to create task."') {
        let response = JSON.parse(this.responseText);
        localStorage.setItem("taskIds", response.board_ids);
        window.location.href = "../Tasks/index.html";
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

    let boardId = localStorage.getItem('boardId');
    let task = document.getElementById("taskName").value;
    let ownerName = document.getElementById("ownerName").value;
    let dueDate = document.getElementById("dueDate").value;
    //let users = document.getElementById("users").value;

    let xmlHttp = new XMLHttpRequest();
    let requestURL = "http://scrum375.lroy.us/inserttask"
    xmlHttp.addEventListener("load", registerResponseReceivedHandler);
    xmlHttp.open("POST", requestURL);
    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xmlHttp.send("board_id=" + boardId + "&task=" + task + "&owner=" + owner + "&due_date=" + dueDate);
});

document.addEventListener('readystatechange', event => {
    if (event.target.readyState !== "interactive"
        && event.target.readyState !== "complete") {
        return;
    } else {
        getTasks();
    }
});

function getTasks() {

    let boardId = localStorage.getItem('boardId');
    if (boardId !== null) {
        let xmlHttp = new XMLHttpRequest();
        let requestURL = "http://scrum375.lroy.us/gettasks";

        xmlHttp.addEventListener("load", function () {
            console.log(this.responseText);
            let tasksArr = JSON.parse(this.responseText);
            let taskArea = document.getElementById('taskArea');
            let taskAreaStr = '';

            for (var i = 0; i < tasksArr.length; i++) {
                let task = JSON.parse(tasksArr[i].task_data);

                let taskName = task.task;
                let owner = task.owner;
                let dueDate = new Date(task.due_date);

                let dueDateStr = dueDate.toString().substring(4, 10) + ', ' + dueDate.toString().substring(11, 15);

                switch (task.status) {
                    case 0:
                        taskAreaStr += '<div class="task-card todo" style="float: left"><p id="taskName">Task: ' + taskName + '</p><p id="owner">Owner: ' + owner + '</p><p id="dueDate">Due: ' + dueDateStr + '</p></div>';
                        break;
                    case 1:
                        taskAreaStr += '<div class="task-card doing" style="margin-left: 43%"><p id="taskName">Task: ' + taskName + '</p><p id="owner">Owner: ' + owner + '</p><p id="dueDate">Due: ' + dueDateStr + '</p></div>';
                        break;
                    case 2:
                        taskAreaStr += '<div class="task-card done" style="float: right"><p id="taskName">Task: ' + taskName + '</p><p id="owner">Owner: ' + owner + '</p><p id="dueDate">Due: ' + dueDateStr + '</p></div>';
                        break;
                }
            }

            taskArea.innerHTML = taskAreaStr;
            console.log(taskArea);
            sortTasks();
        });

        xmlHttp.open("POST", requestURL);
        xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xmlHttp.send("board_id=" + boardId);
    }
}

function populateTaskArea(tasksArr) {
    let taskArea = document.getElementById('taskArea');
    let taskAreaStr = '';
    for (var i = 0; i < tasksArr.length; i++) {
        let task = tasksArr[i];
        taskAreaStr += '<div class="task-card">' + task.innerHTML + '</div>';
    }
    taskArea.innerHTML = taskAreaStr;
}

function sortTasks() {
    let sortBy = document.getElementById("sortBy").value;
    let tasksArr = Array.from(document.getElementsByClassName("task-card"));

    switch (sortBy) {
        case "dueSoonest":
            tasksArr.sort(compareDueDate);
            break;
    }
    populateBoardArea(tasksArr);
}
function compareDueDate(a, b) {
    return compareDates(a.querySelector("#dueDate").textContent.substring(5), b.querySelector("#dueDate").textContent.substring(5));
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

document.getElementById('profileSide').href = '../Profile/' + localStorage.getItem('username') + '/';
document.getElementById('profileTop').href = '../Profile/' + localStorage.getItem('username') + '/';
