const axios = require('axios');
const DAO = require('./DAO.js');

class AimTrainerDB
{
    constructor(dao)
    {
        this.dao = dao;
    }

    async addUser(name)
    {
        await axios.get(`https://api.mojang.com/users/profiles/minecraft/${name}`).then(async(user) =>
        {
            if(user.data.id)
            {
                let emptyRankedGamesString = "-1";
                await this.dao.exec(`INSERT OR IGNORE INTO users (uuid, username, rankedGames) VALUES(\"${user.data.id}\", \"${name.toLowerCase()}\", \"${emptyRankedGamesString}\")`);
            }

        }, (error) =>
        {
        });
    }
    async getLeaderBoard(gameType)
    {
        let retVal =
        {
            error: undefined,
            data: undefined
        }
        await this.dao.all(`SELECT DISTINCT games.player, games.points, users.uuid FROM (games INNER JOIN users ON games.player = users.username) WHERE games.type=\"${gameType}\" GROUP BY player ORDER BY games.points DESC`).then(async(leaderboard)=>
        {
            console.log(leaderboard);
            retVal.data = leaderboard
        }, (err) =>
        {
            retVal.error = err;
        });
        return retVal;
    }

    async getGamesPlayed(player)
    {
        let retVal =
        {
            error: undefined,
            data: undefined
        }

        let user = await this.getUserWithName(player);
        if(user.data.rankedGames == "-1")
        {
            retVal.data = "-1";
            return retVal;
        }
        let gameIDArr = user.data.rankedGames.split(',');
        retVal.data = [];
        for(let i = gameIDArr.length - 1; i > -1; i--)
        {
            await this.dao.get(`SELECT * FROM games WHERE id=\"${gameIDArr[i]}\"`).then(async(game)=>
            {
                await retVal.data.push(game);
            }, (err) =>
            {
                retVal.error = err;
                return retVal;
            });
        }
        return retVal;

    }
    async addGameToUser(gameID, playerName)
    {
        let user = await this.getUserWithName(playerName);
        if(user.data.rankedGames == '-1')
        {
            await this.dao.exec(`UPDATE users SET rankedGames=\"${gameID}\" WHERE uuid=\"${user.data.uuid}\"`);
        } else
        {
            await this.dao.exec(`UPDATE users SET rankedGames=\"${user.data.rankedGames + "," + gameID}\" WHERE uuid=\"${user.data.uuid}\"`);
        }
    }

    async getUserWithName(name)
    {
        let retVal =
        {
            error : undefined,
            data : undefined
        }
        await axios.get(`https://api.mojang.com/users/profiles/minecraft/${name}`).then( async(user) =>
        {
            await this.addUser(name);
            await this.dao.get(`SELECT * FROM users WHERE uuid=\"${user.data.id}\"`).then( (data) =>
            {
                retVal.data = data;
            });
        }, (err) =>
        {
            retVal.error = err;
        });
        return retVal
    }

    async getUserWithUUID(uuid)
    {
        let retVal =
        {
            error : undefined,
            data : undefined
        }

        await this.dao.get(`SELECT * FROM users WHERE uuid=\"${uuid}\"`).then(async(data) =>
        {
            retVal.data = data;
        }, (err) =>
        {
            retVal.error = err;
        });
        return retVal;
    }

    async insertGame(game)
    {
        await this.dao.get(`SELECT MAX(id) as max FROM games`).then( async(data) =>
        {
            await this.addUser(game.name);
            if(data && data.max !== null)
            {
                await this.dao.exec(`INSERT INTO games (id, type, points, player) VALUES(\"${data.max + 1}\", \"${game.type}\", \"${game.points}\", \"${game.name}\")`);
                await this.addGameToUser(data.max + 1, game.name);
                return;
            } else 
            {
                await this.dao.exec(`INSERT INTO games (id, type, points, player) VALUES(\"0\", \"${game.type}\", \"${game.points}\", \"${game.name}\")`);
                await this.addGameToUser(0, game.name);
                return;
            }
        });
    }

    async getGame(gameID)
    {
        let retVal =
        {
            error : undefined,
            data : undefined
        }
        await db.get(`SELECT \"${gameID}\" FROM games`, async(data) =>
        {
            retVal.data = data;
        }, (err) =>
        {
            retVal.error = err;
        });
    }
}

module.exports = AimTrainerDB;
