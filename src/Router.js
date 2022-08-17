const express = require('express');
const Controller = require('./controllers/Controller.js');
const Router = express.Router();

Router.get('/api/getUserWithUUID/:uuid', Controller.getUserWithUUID);
Router.get('/api/getUserWithName/:name', Controller.getUserWithName);
Router.get('/api/getSkin/:uuid', Controller.getSkin);
Router.get('/api/getLeaderboard/:type', Controller.getLeaderboard);
Router.get('/api/getGamesPlayed/:player', Controller.getGamesPlayed);

Router.post('/api/insertGame', Controller.insertGame);

module.exports = Router;