const express = require('express');
const routes = require('./routes');

class App{

    constructor()
    {
        this.server = express();
        this.routes();
        this.middleware();
        this.database();
    }

    routes()
    {
        this.server.use(routes);
    }

    middleware()
    {
        this.server.use(express.json());
        this.server.set('view engine', 'ejs');
    }

    database()
    {
        //when the database is implemented, here is the connection method 
    }

}

module.exports = new App().server;