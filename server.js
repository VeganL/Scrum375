// Declaring/importing necessary files and frameworks
var express = require("express");

// Instantiating an express instance
var app = express();

// Serves content on port 8080 from the directory named "public"
app.use(express.static("public"));
app.listen(80);