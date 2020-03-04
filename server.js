// Declaring/importing necessary files and frameworks
var express = require("express");
var bodyParser = require("body-parser");

var mariadb = require("mariadb");
var dbKey = require("../mariadb_info.json");
var pool = mariadb.createPool({
    host: dbKey.host,
    database: dbKey.database,
    user: dbKey.user,
    password: dbKey.password,
    connectionLimit: dbKey.connectionLimit
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

    async function signin () {
        let conn;
        try {
            conn = await pool.getConnection();
            const response = await conn.query("SELECT user_id, board_ids FROM accounts WHERE username='" + username + "' AND password='" + password + "';");
            res.send(response); // { affectedRows: 1, insertId: 1, warningStatus: 0 }
      
        } catch (err) {
            throw err;
        } finally {
            if (conn) return conn.end();
        }
    }
});