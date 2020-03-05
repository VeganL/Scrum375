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
            res.send('"invalid"');
        }
	})
	.catch(err => {
	    throw err;
    });
});
