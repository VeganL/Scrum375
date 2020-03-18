// Declaring/importing necessary files and frameworks
var express = require("express");
var bodyParser = require("body-parser");
var fs = require("fs");
//var profilePg = require("./profile_template.html");

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
            .then(
                pool
                .query("SELECT user_id FROM accounts WHERE username='" + username + "'")
                .then(rows => {
                    if (typeof rows[0] !== 'undefined') {
                        res.send(rows[0]);
                    } else {
                        res.send('"Unable to sign in user."');
                    }
                })
            )
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
                        // let boardIds = rows[0].board_ids;
                        // let boardIdSet = boardIds.substr(1, boardIds.length - 2)
                        if (typeof rows[0] !== 'undefined') {
                            res.send(rows[0]);
                        } else {
                            res.send('"Unable to retrieve boards."');
                        }

                        // pool
                        // .query("SELECT board_id,owner_id,board_data FROM boards WHERE board_id IN(" + boardIdSet + ")")
                        // .then(rows => {
                        //     res.send(rows);
                        // })
                        // .catch(err => {
                        //     throw err;
                        // });
                    })
                    .catch(err => { throw err; })
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
                        // let boardIds = rows[0].board_ids;
                        // let boardIdSet = boardIds.substr(1, boardIds.length - 2)
                        if (typeof rows[0] !== 'undefined') {
                            res.send(rows[0]);
                        } else {
                            res.send('"Unable to retrieve boards."');
                        }

                        // pool
                        // .query("SELECT board_id,owner_id,board_data FROM boards WHERE board_id IN(" + boardIdSet + ")")
                        // .then(rows => {
                        //     res.send(rows);
                        // })
                        // .catch(err => {
                        //     throw err;
                        // });
                    })
                )
                .catch(err => {throw err})
            }
        })
        .catch(err => {throw err})
    })
    .catch(err => {throw err});

});

app.post("/updateboardname", function (req, res) {
    let boardId = req.body.board_id;
    let newName = req.body.new_name;

    let date = new Date()
    let boardDate = date.toISOString().substring(0,10);

    pool
    .query("SELECT board_data FROM boards WHERE board_id=" + boardId)
    .then(rows => {
        let oldData = JSON.parse(rows[0].board_data);
        oldData.board_name = newName;
        oldData.date_modified = boardDate;
        let newData = JSON.stringify(oldData);

        pool
        .query("UPDATE boards SET board_data='" + newData + "' WHERE board_id=" + boardId)
        .then(res.send(oldData))
        .catch(err => { throw err });
    })
    .catch(err => { throw err });
});

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

app.post("/promotetask", function (req,res) {
    let task_data = req.body.task_data;
    let taskData = JSON.parse(task_data);

    let date = new Date()
    let modDate = date.toISOString().substring(0,10);

    pool.query("SELECT board_id FROM tasks WHERE task_data='" + task_data + "'")
    .then(rows => {
        let boardId = rows[0].board_id;

        pool.query("SELECT board_data FROM boards WHERE board_id=" + boardId)
        .then(vals => {
            let boardData = JSON.parse(vals[0].board_data);
            boardData.date_modified = modDate;
            let newBoardData = JSON.stringify(boardData);

            pool
            .query("UPDATE boards SET board_data='" + newBoardData + "' WHERE board_id=" + boardId)
            .then().catch(err => {throw err});  
        }).catch(err => {throw err});
    }).catch(err => {throw err});

    taskData.date_modified = modDate;
    if (taskData.status < 2) {
        taskData.status += 1;
    }
    
    let newTaskData = JSON.stringify(taskData);

    pool.query("UPDATE tasks SET task_data='" + newTaskData + "' WHERE task_data='" + task_data +"'")
    .then(res.send(taskData)).catch(err => {throw err});
});

app.post("/demotetask", function (req,res) {
    let task_data = req.body.task_data;
    let taskData = JSON.parse(task_data);

    let date = new Date()
    let modDate = date.toISOString().substring(0,10);

    pool.query("SELECT board_id FROM tasks WHERE task_data='" + task_data + "'")
    .then(rows => {
        let boardId = rows[0].board_id;

        pool.query("SELECT board_data FROM boards WHERE board_id=" + boardId)
        .then(vals => {
            let boardData = JSON.parse(vals[0].board_data);
            boardData.date_modified = modDate;
            let newBoardData = JSON.stringify(boardData);

            pool
            .query("UPDATE boards SET board_data='" + newBoardData + "' WHERE board_id=" + boardId)
            .then().catch(err => {throw err});  
        }).catch(err => {throw err});
    }).catch(err => {throw err});

    taskData.date_modified = modDate;
    if (taskData.status > 0) {
        taskData.status -= 1;
    }
    
    let newTaskData = JSON.stringify(taskData);

    pool.query("UPDATE tasks SET task_data='" + newTaskData + "' WHERE task_data='" + task_data +"'")
    .then(res.send(taskData)).catch(err => {throw err});
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
    let profilePg = '<head lang="en"><title>Scrum375 | Tasks</title><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"><link rel="stylesheet" type="text/css" href="../css/main.css"></head>';
    profilePg += '<body><div id="bars"><div class="topbar"><h1>scrum375</h1><div id="dropdown" hidden><a href="../Register/">Register</a><a href="../Login/">Login</a><a href="../About/">About</a></div><i id="hamburger" class="icon fa fa-bars"></i></div><div class="sidebar"><div class="vertical-center" style="text-align: center;"><h1 id="header-firstline">scrum</h1><h1 id="header-secondline">375</h1><a href="../Register/">Register</a><a href="../Login/">Login</a><a href="../About/">About</a></div></div></div><div class="content"><div class="vertical-center"></div>';

    pool
    .query("SELECT avatar, about FROM accounts WHERE username='" + username + "'")
    .then(rows => {
        let profilePg += '<h1>' + username + '</h1><p>';
        if (rows[0].avatar !== null) {
            profilePg += '<img src="' + rows[0].avatar + '">';
        } else {
            profilePg += '<img src="../../img/scrum375.svg">';
        }
        
        profilePg += '</p><p>';
        
        if (rows[0].about !== null) {
            profilePg += rows[0].about;
        } else {
            profilePg += 'This user has shared no information about themselves.';
        }

        profilePg += `</p></div></div><script>if (localStorage.getItem('username') !== null) {document.getElementById('bars').innerHTML = '<div class="topbar"><h1>scrum375</h1><div id="dropdown" hidden><a href="../Boards/">Manage</a><a href="../Profile/' + localStorage.getItem('username') + '">Profile</a><a href="../About/">About</a></div><i id="hamburger" class="icon fa fa-bars"></i></div><div class="sidebar"><div class="vertical-center" style="text-align: center;"><h1 id="header-firstline">scrum</h1><h1 id="header-secondline">375</h1><a href="../Boards/">Manage</a><a href="../Profile/' + localStorage.getItem('username') + '">Profile</a><a href="../About/">About</a></div></div>';}</script></body>`;

        if (typeof rows[0] !== 'undefined') {
            res.send(profilePg);
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
