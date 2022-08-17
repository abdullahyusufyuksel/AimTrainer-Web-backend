var sqlite3 = require('sqlite3');
class DAO
{
    constructor()
    {
      this.initializeDatabase();
    }

    async get(sql, params = []) {
      return new Promise((resolve, reject) => {
        this.db.get(sql, params, (err, result) => {
          if (err) {
            console.log('Error running sql: ' + sql)
            console.log(err)
            reject(err)
          } else {
            resolve(result)
          }
        })
      })
    }

      
    async exec(sql, params = []) {
      try {
        return new Promise((resolve, reject) => {
          this.db.run(sql, params, function (err) {
            if (err) {
              console.log('Error running sql ' + sql)
              console.log(err)
              reject(err)
            } else {
              resolve()
            }
          })
        })
      } catch (error) {}
    }

    async all(sql, params = []) {
      return new Promise((resolve, reject) => {
        this.db.all(sql, params, (err, rows) => {
          if (err) {
            console.log('Error running sql: ' + sql)
            console.log(err)
            reject(err)
          } else {
            console.log(rows);
            resolve(rows)
          }
        })
      })
    }


    initializeDatabase = async() =>
    {
              // Database Initialization
              this.db = new sqlite3.Database('./AimTrainerDB.db', sqlite3.OPEN_READWRITE, async(err) =>
              {
                  if(err && err.code == 'SQLITE_CANTOPEN') 
                  {
                      await this.createDatabase();
                      await this.initializeDatabase();
                  } else if(err)
                  {
                      console.log("Error when initializing database.");
                      console.log(err);
                  }
              });
    }
    createDatabase = async() =>
    {
        var newDB = new sqlite3.Database('AimTrainerDB.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, async(err) => 
        {
            if (err) {
                console.log("Error when initializing databse ");
                exit(1);
            }
            await this.createTables(newDB);
        });
    }

    createTables = async() =>
    {
        let sql = 
        `CREATE TABLE IF NOT EXISTS users
        (
            uuid TEXT PRIMARY KEY,
            username TEXT NOT NULL,
            rankedGames TEXT NOT NULL
        );`;
        await this.exec(sql);

        sql =
        `CREATE TABLE IF NOT EXISTS games
        (
            id INTEGER PRIMARY KEY,
            type TEXT NOT NULL,
            points INTEGER NOT NULL,
            player TEXT NOT NULL
        );`;
        await this.exec(sql);
    }     
}


module.exports = DAO;