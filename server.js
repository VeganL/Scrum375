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
    .query("SELECT board_data FROM boards WHERE board_id IN(" + boardIdSet + ")")
    .then(rows => {
        res.send(rows[0]);
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
    .then(res.send(boardData))
    .catch(err => {throw err});
});
