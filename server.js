// Declaring/importing necessary files and frameworks
var express = require("express");
var bodyParser = require("body-parser");

var mariadb = require("mariadb");
var dbKey = require("../mariadb_info.json");
var pool = mariadb.createPool({
    database: dbKey.database,
    user: dbKey.user,
    password: dbKey.password,
});

// Instantiating an express instance
var app = express();

// Serves content on port 8080 from the directory named "public"
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.listen(8080);

app.post("/signin", function (req, res) {
    let username = req.body.username;
    let password = req.body.password;

    pool
	.query("SELECT user_id,board_ids FROM accounts WHERE username='" + username+ "' AND password='" + password + "'")
	.then(rows => {
        if (typeof rows[0] !== 'undefined') {
            res.send(rows[0]);
        } else {
            res.send('"Username or password is incorrect."');
        }
	})
	.catch(err => {
	    throw err;
    });
});

app.post("/registernew", function (req, res) {
    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;

    pool
    .query("SELECT user_id FROM accounts WHERE username='" + username + "' OR email='" + email + "'")
    .then(rows => {
        if (typeof rows[0] === 'undefined') {
            pool
            .query("INSERT INTO accounts (username, password, email) VALUES ('" + username + "', '" + password + "', '" + email + "')")
            .then(res.send('"Registration success"'))
            .catch(err => {
                throw err;
            });
        } else {
            res.send('"Username or email already used."')
        }
    })
    .catch(err => {
        throw err;
    });
});

app.post("/getboards", function (req, res) {
    let boardIds = req.body.board_ids;
    let boardIdSet = boardIds.substring(1, boardIds.length - 1);

    pool
    .query("SELECT board_id,owner_id,board_data FROM boards WHERE board_id IN(" + boardIdSet + ")")
    .then(rows => {
        res.send(rows);
    })
    .catch(err => {
        throw err;
    });
});

app.post("/insertboard", function (req, res) {
    let ownerId = req.body.owner_id; //same as user_id in other parts of project, but specifically who owns board
    let boardName = req.body.board_name;
    let date = new Date()
    let boardDate = date.toISOString().substring(0,10);

    let boardData = '{"board_name": "' + boardName + '", "date_created": "' + boardDate + '", "date_modified": "' + boardDate + '", "member_amt": 1, "task_amt": 0}';

    pool
    .query("INSERT INTO boards (owner_id, board_data) VALUES (" + ownerId + ", '" + boardData + "')")
    .then()
    .catch(err => {throw err});
    
    pool
    .query("SELECT board_id FROM boards WHERE board_data='" + boardData + "'")
    .then(rows => {
        pool
        .query("SELECT board_ids FROM accounts WHERE user_id=" + ownerId)
        .then(vals => {
            if (vals[0].board_ids === null) {
                pool
                .query("UPDATE accounts SET board_ids='[" + rows[0].board_id + "]' WHERE user_id=" + ownerId)
                .then(
                    pool
                    .query("SELECT board_ids FROM accounts WHERE user_id=" + ownerId)
                    .then(rows => {
                        let boardIds = rows[0].board_ids;
                        let boardIdSet = boardIds.substr(1, boardIds.length - 2)

                        pool
                        .query("SELECT board_id,owner_id,board_data FROM boards WHERE board_id IN(" + boardIdSet + ")")
                        .then(rows => {
                            res.send(rows);
                        })
                        .catch(err => {
                            throw err;
                        });
                    })
                )
            } else {
                let board_ids = vals[0].board_ids;
                let idStrArr = board_ids.substr(1,board_ids.length).split(',');
                let idArr = [];

                for (var i = 0; i< idStrArr.length; i++) {
                    idArr.push(parseInt(idStrArr[i]));
                }

                idArr.push(parseInt(rows[0].board_id));
                let boardIds = JSON.stringify(idArr);

                pool
                .query("UPDATE accounts SET board_ids='" + boardIds + "' WHERE user_id=" + ownerId)
                .then(
                    pool
                    .query("SELECT board_ids FROM accounts WHERE user_id=" + ownerId)
                    .then(rows => {
                        let boardIds = rows[0].board_ids;
                        let boardIdSet = boardIds.substr(1, boardIds.length - 2)

                        pool
                        .query("SELECT board_id,owner_id,board_data FROM boards WHERE board_id IN(" + boardIdSet + ")")
                        .then(rows => {
                            res.send(rows);
                        })
                        .catch(err => {
                            throw err;
                        });
                    })
                )
                .catch(err => {throw err})
            }
        })
        .catch(err => {throw err})
    })
    .catch(err => {throw err});

});

app.post("/updateboardname", function (req, res) { //TODO: Make this function update date_modified
    let boardId = req.body.board_id;
    let newName = req.body.newName;
    let oldName = req.body.oldName;
    let oldData = '';
    let newData = '';

    if (newName === oldName)
        return;

    pool
        .query("SELECT board_data FROM boards WHERE board_id=" + boardId)
        .then(rows => {
            if (typeof rows[0] === 'undefined') {
                oldData = JSON.parse(rows[0]);
            } else {
                res.send("Board ID '" + boardId + "' does not exist.");
            }
        })
        .catch(err => { throw err });

    oldData.board_name = newName;
    newData = JSON.stringify(oldData);
    pool
        .query("UPDATE boards SET board_data='" + newData + "' WHERE board_id=" + boardId)
        .then()
        .catch(err => { throw err });
});

app.post("/deleteboard", function (req,res) { //TODO: Complete this
    
});

/*app.post("/updateboardmemberamt", function (req, res) {
    let boardId = req.body.board_id;
    let newAmt = req.body.newAmt;
    let oldAmt = req.body.oldAmt;
    let oldData = '';
    let newData = '';

    if (newAmt === oldAmt)
        return;

    pool
        .query("SELECT board_data FROM boards WHERE board_id=" + boardId)
        .then(rows => {
            if (typeof rows[0] === 'undefined') {
                oldData = JSON.parse(rows[0]);
            } else {
                res.send("Board ID '" + boardId + "' does not exist.");
            }
        })
        .catch(err => { throw err });

    oldData.member_amt = newAmt;
    newData = JSON.stringify(oldData);
    pool
        .query("UPDATE boards SET board_data='" + newData + "' WHERE board_id=" + boardId)
        .then()
        .catch(err => { throw err });
});

app.post("/updateboardtaskamt", function (req, res) {
    let boardId = req.body.board_id;
    let newAmt = req.body.newAmt;
    let oldAmt = req.body.oldAmt;
    let oldData = '';
    let newData = '';

    if (newAmt === oldAmt)
        return;

    pool
        .query("SELECT board_data FROM boards WHERE board_id=" + boardId)
        .then(rows => {
            if (typeof rows[0] === 'undefined') {
                oldData = JSON.parse(rows[0]);
            } else {
                res.send("Board ID '" + boardId + "' does not exist.");
            }
        })
        .catch(err => { throw err });

    oldData.task_amt = newAmt;
    newData = JSON.stringify(oldData);
    pool
        .query("UPDATE boards SET board_data='" + newData + "' WHERE board_id=" + boardId)
        .then()
        .catch(err => { throw err });
});*/

app.post("/gettasks", function (req,res) {
    let boardId = req.body.board_id;

    pool
    .query("SELECT task_data FROM tasks WHERE board_id=" + boardId)
    .then(rows => {
        res.send(rows);
    })
    .catch(err => {throw err});
});

app.post("/inserttask", function (req,res) {
    let boardId = req.body.board_id;
    let task = req.body.task;
    let ownerName = req.body.owner;
    let dueDate = req.body.due_date;
    let date = new Date()
    let createDate = date.toISOString().substring(0,10);

    let taskData = '{"task": "' + task + '", "owner": "' + ownerName + '", "due_date": "' + dueDate + '", "status": 0, "date_created": "' + createDate + '", "date_modified": "' + createDate + '"}';

    pool
    .query("SELECT board_data FROM boards WHERE board_id=" + boardId)
    .then(rows => {
        let boardData = JSON.parse(rows[0].board_data);

        boardData.task_amt += 1;
        boardData.date_modified = createDate;

        let newBoardData = JSON.stringify(boardData);

        pool.query("UPDATE boards SET board_data='" + newBoardData + "' WHERE board_id=" + boardId).then().catch(err => {throw err});
    })
    .catch(err => {throw err});

    pool
    .query("INSERT INTO tasks (board_id,task_data) VALUES (" + boardId + ", '" + taskData + "')")
    .then(
	    pool
	    .query("SELECT task_data FROM tasks WHERE board_id=" + boardId)
	    .then(rows => {
		res.send(rows);
	    })
	    .catch(err => {throw err})
    ).catch(err => {throw err});
});

app.post("/promotetask", function (req,res) { //TODO: Complete this

});

app.post("demotetask", function (req,res) { //TODO: Complete this

});

app.post("/deletetask", function (req,res) {
    let taskData = req.body.task_data;
    let date = new Date()
    let modDate = date.toISOString().substring(0,10);

    pool
    .query("SELECT board_id FROM tasks WHERE task_data='" + taskData + "'")
    .then(rows => {
        let boardId = rows[0].board_id;

        pool
        .query("DELETE FROM tasks WHERE task_data='" + taskData + "'")
        .then(
            pool
            .query("SELECT board_data FROM boards WHERE board_id=" + boardId)
            .then(vals => {
                let boardData = JSON.parse(vals[0].board_data);
        
                boardData.task_amt -= 1;
                boardData.date_modified = modDate;
        
                let newBoardData = JSON.stringify(boardData);
        
                pool.query("UPDATE boards SET board_data='" + newBoardData + "' WHERE board_id=" + boardId).then(
                    pool.query("SELECT task_data FROM tasks WHERE board_id=" + boardId).then(resp => {res.send(resp)}).catch(err => {throw err})
                ).catch(err => {throw err});
            })
        ).catch(err => {throw err});
    })
    .catch(err => {throw err});
});

app.post("/insertmembers", function (req,res) {
    let boardId = req.body.board_id;
    let user_list = req.body.user_list;
    let userList = user_list.substring(1,user_list.length - 1).split(','); //might have to modify this to (', ') depending on how front-end formats

    let date = new Date()
    let modDate = date.toISOString().substring(0,10);

    pool
    .query("SELECT board_data FROM boards WHERE board_id=" + boardId)
    .then(rows => {
        let boardData = JSON.parse(rows[0].board_data);

        boardData.date_modified = modDate;
	    boardData.member_amt += userList.length;

        let newBoardData = JSON.stringify(boardData);

        pool
        .query("UPDATE boards SET board_data='" + newBoardData + "' WHERE board_id=" + boardId)
        .then().catch(err => {throw err});
    })
    .catch(err => {throw err});

    for (var i = 0; i<userList.length; i++) {
	    let user = userList[i];
	
        pool
        .query("SELECT board_ids FROM accounts WHERE username=" + user)
        .then(rows => {
            if (typeof rows[0] === 'undefined') {
                pool
                .query("SELECT board_data FROM boards WHERE board_id=" + boardId)
                .then(rows => {
                    let boardData = JSON.parse(rows[0].board_data);
                    boardData.member_amt -= 1;

                    let newBoardData = JSON.stringify(boardData);

                    pool
                    .query("UPDATE boards SET board_data='" + newBoardData + "' WHERE board_id=" + boardId)
                    .then().catch(err => {throw err});
                })
                .catch(err => {throw err});
            } else if (rows[0].board_ids === null) {
                pool
                .query("UPDATE accounts SET board_ids='[" + boardId + "]' WHERE username=" + user)
                .then().catch(err => {throw err})
            } else {
                let board_ids = rows[0].board_ids;
                let idStrArr = board_ids.substr(1,board_ids.length).split(',');
                let idArr = [];

                for (var i = 0; i< idStrArr.length; i++) {
                    idArr.push(parseInt(idStrArr[i]));
                }

                idArr.push(parseInt(boardId));
                let boardIds = JSON.stringify(idArr);

                pool
                .query("UPDATE accounts SET board_ids='" + boardIds + "' WHERE username=" + user)
                .then().catch(err => {throw err})
            }
        })
        .catch(err => {throw err});
    }
    res.send('"Queries sent to insert members"');
});

app.post("/deletemembers", function (req,res) {
    let boardId = req.body.board_id;
    let user_list = req.body.user_list;
    let userList = user_list.substring(1,user_list.length - 1).split(','); //might have to modify this to (', ') depending on how front-end formats

    let date = new Date()
    let modDate = date.toISOString().substring(0,10);

    pool
    .query("SELECT board_data FROM boards WHERE board_id=" + boardId)
    .then(rows => {
        let boardData = JSON.parse(rows[0].board_data);

        boardData.date_modified = modDate;
	    boardData.member_amt -= userList.length;

        let newBoardData = JSON.stringify(boardData);

        pool
        .query("UPDATE boards SET board_data='" + newBoardData + "' WHERE board_id=" + boardId)
        .then().catch(err => {throw err});
    })
    .catch(err => {throw err});

    for (var i = 0; i<userList.length; i++) {
	    let user = userList[i];
	
        pool
        .query("SELECT board_ids FROM accounts WHERE username=" + user)
        .then(rows => {
            if ((typeof rows[0] === 'undefined') || (rows[0].board_ids === null)) {
                pool
                .query("SELECT board_data FROM boards WHERE board_id=" + boardId)
                .then(rows => {
                    let boardData = JSON.parse(rows[0].board_data);
                    boardData.member_amt += 1;

                    let newBoardData = JSON.stringify(boardData);

                    pool
                    .query("UPDATE boards SET board_data='" + newBoardData + "' WHERE board_id=" + boardId)
                    .then().catch(err => {throw err});
                })
                .catch(err => {throw err});
            } else {
                let board_ids = rows[0].board_ids;
                let idStrArr = board_ids.substr(1,board_ids.length).split(',');
                let idArr = [];

                for (var i = 0; i< idStrArr.length; i++) {
                    idArr.push(parseInt(idStrArr[i]));
                }

                idArr.pop();
                if (idArr.length === 0) {
                    pool
                    .query("UPDATE accounts SET board_ids=NULL WHERE username=" + user)
                    .then().catch(err => {throw err})
                } else {
                    let boardIds = JSON.stringify(idArr);

                    pool
                    .query("UPDATE accounts SET board_ids='" + boardIds + "' WHERE username=" + user)
                    .then().catch(err => {throw err})
                }
            }
        }).catch(err => {throw err});
    }
    res.send('"Queries sent to delete members"');
});

app.get("/Profile/:username", function (req,res) {
    let username = req.params.username;

    pool
    .query("SELECT avatar, about FROM accounts WHERE username='" + username + "'")
    .then(rows => {
        if (typeof rows[0] !== 'undefined') {
            res.send(rows[0]);
        } else {
            res.send('"User does not exist."');
        }
    })
    .catch(err => {throw err});
});

app.post("/updateabout", function (req,res) {
    let userId = req.body.user_id;
    let newAbout = req.body.about;

    pool
    .query('UPDATE accounts SET about="' + newAbout + '" WHERE user_id=' + userId)
    .then(
        pool.query("SELECT avatar, about FROM accounts WHERE user_id=" + userId)
        .then(rows => {
            res.send(rows[0]);
        }).catch(err => {throw err})
    ).catch(err => {throw err});
});
