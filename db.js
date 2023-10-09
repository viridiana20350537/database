const mysql = require('mysql');

const connection = {
    host: 'localhost',
    port: 3306,
    database: 'backend',
    user: 'root',
    password: ''
};

const conn = mysql.createConnection(connection);

conn.connect((err) => {
    if (err) {
        console.log("Erros ocurred while connecting to MySQL databse.")
    } else {
        console.log("Connection with MySQL databse created successfully.")
    }
})

module.exports = conn;