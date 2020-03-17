function getBoards() {
    let boardIds = localStorage.getItem('boardIds');
    if (boardIds !== null) {
        let xmlHttp = new XMLHttpRequest();
        let requestURL = "http://scrum375.lroy.us/getboards";
        
        xmlHttp.addEventListener("load", function () {
            let boardsArr = JSON.parse(this.responseText);
            let boardArea = document.getElementById('boardArea');
            let boardAreaStr = '';

            for (var i = 0; i<boardsArr.length; i++) {
                let board = JSON.parse(boardsArr[i].board_data);

                let modDate = new Date(board.date_modified);
                let createDate = new Date(board.date_created);

                let modDateStr = modDate.toString().substring(4,10) + ', ' + modDate.toString().substring(11,15);
                let createDateStr = createDate.toString().substring(4,10) + ', ' + createDate.toString().substring(11,15);

                boardAreaStr += '<div class="board-card"><h3>' + board.board_name + '</h3><p>Last modified: ' + modDateStr + '</p><p>Created on: ' + createDateStr + '</p><p>Members: ' + String(board.member_amt) + '</p><p>Tasks: ' + String(board.task_amt) + '</p></div>';
            }

            boardArea.innerHTML = boardAreaStr;
        });

        xmlHttp.open("POST", requestURL);
        xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xmlHttp.send("board_ids=" + boardIds);
    }
}

