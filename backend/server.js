const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const db = require("./database");

const app = express();

app.use(cors());
app.use(express.json());

db.run(`
    CREATE TABLE IF NOT EXISTS users (

        id INTEGER
            PRIMARY KEY AUTOINCREMENT,

        username TEXT
            UNIQUE NOT NULL,

        password TEXT
            NOT NULL
    )
`);

db.run(`
    CREATE TABLE IF NOT EXISTS teams (

        id INTEGER
            PRIMARY KEY AUTOINCREMENT,

        user_id INTEGER
            NOT NULL,

        team_name TEXT
            NOT NULL,

        team_data TEXT
            NOT NULL,

        created_at DATETIME
            DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY(user_id)
            REFERENCES users(id)
    )
`);

app.post(
    "/register",
    async (
        req,
        res
    ) => {

        const {

            username,
            password

        } = req.body;

        if (
            !username ||
            !password
        ) {

            return res
                .status(400)
                .json({

                    error:
                        "Dados inválidos."
                });
        }

        try {

            const hash =
                await bcrypt.hash(
                    password,
                    10
                );

            db.run(

                `
                INSERT INTO users
                (
                    username,
                    password
                )
                VALUES
                (
                    ?,
                    ?
                )
                `,
                [
                    username,
                    hash
                ],

                function(error) {

                    if (error) {

                        return res
                            .status(400)
                            .json({

                                error:
                                    "Usuário já existe."
                            });
                    }

                    res.json({

                        id:
                            this.lastID,

                        username
                    });
                }
            );

        } catch (error) {

            res.status(500)
                .json({

                    error:
                        "Erro interno."
                });
        }
    }
);

app.post(
    "/login",
    (
        req,
        res
    ) => {

        const {

            username,
            password

        } = req.body;

        db.get(

            `
            SELECT *
            FROM users
            WHERE username = ?
            `,

            [username],

            async (
                error,
                user
            ) => {

                if (
                    error
                ) {

                    return res
                        .status(500)
                        .json({

                            error:
                                "Erro interno."
                        });
                }

                if (
                    !user
                ) {

                    return res
                        .status(401)
                        .json({

                            error:
                                "Usuário não encontrado."
                        });
                }

                const validPassword =
                    await bcrypt.compare(

                        password,

                        user.password
                    );

                if (
                    !validPassword
                ) {

                    return res
                        .status(401)
                        .json({

                            error:
                                "Senha incorreta."
                        });
                }

                res.json({

                    id:
                        user.id,

                    username:
                        user.username
                });
            }
        );
    }
);

app.listen(
    3000,
    () =>
        console.log(
            "Servidor iniciado."
        )
);
