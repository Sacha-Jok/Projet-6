const express = require('express');

const userRoutes = require('./routes/user');
const saucesRoutes = require('./routes/sauces');
const path = require('path');

const app = express();

require("dotenv").config({path:'./config/.env'});
require("./config/mongodb")

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use('/api/auth', userRoutes);
app.use('/api/sauces', saucesRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));
module.exports = app;
