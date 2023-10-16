var mysql = require("mysql")
var pool = mysql.createPool({
    host:'localhost',
    port:3306,
    user:'node',
    password:'Rajkishore@210',
    database:'movie',
    connectionLimit:100,
    multipleStatements:true
})
module.exports=pool