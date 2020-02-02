
var mysql = require('mysql');

var connection = mysql.createConnection({
    host:"192.168.99.101",
    port: 3306,
    user:"root",
    password:"docker",
    database:"bamazon"
});

module.exports = connection;