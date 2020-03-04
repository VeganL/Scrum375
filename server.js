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

async function login (username, password) {
    let conn;
    let rows = {};
    try {
        conn = await pool.getConnection();
        rows = await conn.query("SELECT user_id, board_ids FROM accounts WHERE username='" + username + "' AND password='" + password + "';");
    } catch (err) {
        throw err;
    } finally {
        if (conn) {
            conn.end();
            if (rows != {}) {
                return rows[0];
            } else {
                return rows;
            }
        }
    }
}

// Instantiating an express instance
var app = express();

// Serves content on port 8080 from the directory named "public"
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.listen(8080);

app.post("/signin", function (req, res) {
    let username = req.body.username;
    let password = req.body.password;

    res.send(login(username,password));
});