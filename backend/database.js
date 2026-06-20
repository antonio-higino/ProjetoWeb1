const sqlite3 = require("sqlite3").verbose();

const db =
    new sqlite3.Database(
        "./database.db",
        error => {

            if (error) {

                console.error(
                    "Erro ao abrir banco:",
                    error.message
                );

            } else {

                console.log(
                    "Banco conectado."
                );
            }
        }
    );

module.exports = db;
