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
	.query("SELECT user_id FROM accounts WHERE username='" + username+ "' AND password='" + password + "'")
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
    let userId = req.body.user_id;

    pool
    .query("SELECT board_ids FROM accounts WHERE user_id=" + userId)
    .then(rows => {
        if (rows[0].board_ids !== null) {
            let boardIds = JSON.parse(rows[0].board_ids);
            let boardData = [];

            for (var i = 0; i<boardIds.length; i++) {
                pool
                .query("SELECT board_data FROM boards WHERE board_id=" + boardIds[i])
                .then(resp => {
                    boardData.push(JSON.parse(JSON.stringify(JSON.parse(resp[0].board_data))));
                })
                .catch(err => {
                    throw err;
                });
            }

            let jsonStr = '[';
            for (var i = 0; i<boardIds.length; i++) {
                jsonStr += '{"board_id": ' + boardIds[i] + ', "board_data": ' + boardData[i] + '}';
                if (boardIds.length !== 1 && i !== (boardIds.length - 2)) {
                    jsonStr += ',';
                }
            }
            jsonStr += ']';

            res.send(jsonStr);
        } else {
            res.send('[]');
        }
    })
    .catch(err => {
        throw err;
    });
});

app.post("/insertboard", function (req, res) {

});