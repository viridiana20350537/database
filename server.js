const express = require('express');
const usersRouters = require('./routes/users');

class Server {
    constructor() {
        this.app = express();   // Se instancia Express
        this.port = 3000;       // Definimos el puerto

        // Paths    http://localhost:3000/api/v1

        this.basePath = '/api/v1';  // Ruta Base
        this.usersPath = `${this.basePath}/users`;    // Path para la tabla Users
        this.middleware();      // Invocando a los middlewares
        this.routes()   //Invoca a las rutas
    }

    middleware() {
        this.app.use(express.json());    // Para porder interpretar texto en formato JSON
    }

    routes() {
        this.app.use(this.usersPath, usersRouters);   //EndPoint de USers
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log("Server listening on port" + this.port)
        });
    }
}

module.exports = Server;