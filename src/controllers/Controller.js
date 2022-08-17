const axios = require('axios');
const AimTrainerDB = require('../db/AimTrainerDB.js');
const DAO = require('../db/DAO.js');
const PNG = require('pngjs').PNG;
const dao = new DAO();
const db = new AimTrainerDB(dao);
const sharp = require('sharp');
const addUser = async(name) =>
{
    await db.addUser(name);
}

const getUserWithName = async(req, res) =>
{
    await addUser(req.params.name);
    await db.getUserWithName(req.params.name).then( async(retVal) =>
    {
        if(retVal.error)
        {
            res.status(400).send(retVal.error);
            return;
        }
        res.status(200).send(retVal.data);
    });
   
}

const getUserWithUUID = async(req, res) =>
{
    await db.getUserWithUUID(req.params.uuid).then( async(retVal) =>
    {
        if(retVal.error)
        {
            res.status(400).send(error);
            return;
        }
        res.status(200).send(retVal.data);
    })
}

const getHead = function (base64ImageString) 
{
    return new Promise((resolve, reject) =>
    {
        let head = new PNG({width:8, height:8});
        new PNG({ filterType: 4 }).parse(base64ImageString, (error, data) =>{
            data.bitblt(head, 8, 8, 8, 8, 0, 0);
            let buf = PNG.sync.write(head);
            let headBase64ImageString = buf.toString('base64');
            let src = "data:image/png;base64," + headBase64ImageString;
            resolve(src);
        });
    })
}

const resizeHead = async(head) =>
{
    return new Promise(async(resolve, reject) =>
    {
        await sharp(Buffer.from(head, 'base64')).resize(25, 25).toBuffer().then( async(image) =>
        {
            let resizedImage = await image.toString('base64');
            resolve("data:image/png;base64," + resizedImage);
        })
    });
}

const insertGame = async(req, res) =>
{
    await db.insertGame(req.body).then( async() => 
    {
        res.status(200).send("Game was inserted!")
    });
}
const addHeadsToLeaderboard = async(leaderboard) =>
{
    
    for(let i = 0; i < leaderboard.data.length; i++)
    {
        await axios.get(`https://sessionserver.mojang.com/session/minecraft/profile/${leaderboard.data[i].uuid}`).then( async(response) =>
        {
            let buffer = await Buffer.from(response.data.properties[0].value, "base64");
            await axios.get(await JSON.parse(await buffer.toString()).textures.SKIN.url, {responseType: 'arraybuffer'}).then( async(image) =>
            {
                // fs.createReadStream('../skin.png');
                let base64ImageString = await Buffer.from(image.data);
                let head = await getHead(base64ImageString);
                leaderboard.data[i].skinHead = await resizeHead(head.split(';base64,').pop());
            })
        }).catch( (err) =>
        {
        });
    }
    return leaderboard;
}
const getLeaderboard = async(req, res) =>
{
    await db.getLeaderBoard(req.params.type).then( async(retVal) =>
    {
        console.log(retVal);
        if(retVal.error)
        {
            res.status(400).send(error);
            return;
        }
        let leaderboard = await addHeadsToLeaderboard(retVal, 0);
        await res.status(200).send(leaderboard.data);
    });
}

const getGamesPlayed = async(req, res) =>
{
    await db.getGamesPlayed(req.params.player).then( async(retVal) =>
    {
        if(retVal.error)
        {
            res.status(400).send(error);
            return;
        }
        res.status(200).send(retVal.data);
    });
}

const getGame = async(req, res) =>
{
    await db.getGame(req.params.gameID).then( (async(retVal) =>
    {
        if(retVal.error)
        {
            res.status(400).send(retVal.error);
        } else {
            res.status(200).send(retVal.data);
        }
    }));
}

const getSkin = async(req, res) =>
{
    axios.get(`https://sessionserver.mojang.com/session/minecraft/profile/${req.params.uuid}`).then( (response) =>
    {
        let buffer = Buffer.from(response.data.properties[0].value, "base64");
        axios.get(JSON.parse(buffer.toString()).textures.SKIN.url, {responseType: 'arraybuffer'}).then( (image) =>
        {
            let base64ImageString = Buffer.from(image.data, 'binary').toString('base64');
            let srcValue = "data:image/png;base64," + base64ImageString;
            res.status(200).send(srcValue);
        })
    }).catch( (err) =>
    {
        res.status(400).send("Mojang API unresponsive." + err);
    });
}

module.exports = 
{
    addUser,
    getUserWithName,
    getUserWithUUID,
    insertGame,
    getSkin,
    getLeaderboard,
    getGamesPlayed,
}
