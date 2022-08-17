const express = require('express');
const Controller = require('./controllers/Controller.js');
const Router = express.Router();

Router.get('getUserWithUUID/:uuid', Controller.getUserWithUUID);
Router.get('getUserWithName/:name', Controller.getUserWithName);
Router.get('getSkin/:uuid', Controller.getSkin);
Router.get('getLeaderboard/:type', Controller.getLeaderboard);
Router.get('getGamesPlayed/:player', Controller.getGamesPlayed);

Router.post('insertGame', Controller.insertGame);

module.exports = Router;