const { ConnectionPool } = require('mssql');
const {createConnection} = require('mysql2');

module.exports = {

    /**
     * Retrieves a connection pool to a MSSQL Server
     *  REQUIRED Options:
     * 
     *      password -> password for the account logging in
     *          to the database
     * 
     *      username -> username for the account logging in
     *          to the database
     * 
     *      database -> the name of the database to use
     * 
     *      server -> the server the database is hosted on
     * 
     *  OPTIONAL Options:
     *      trust -> sets options.options to default, but with
     *          trusting the server certificate (not recommended 
     *          unless you own or administrate the server you are 
     *          using)
     * 
     *      options -> custom MSSQL options values (check out mssql 
     *          on npm for details)
     * 
     *      pool -> custom MSSQL pool values (check out mssql on npm
     *          for details)
     * 
     * If optional options are left blank, the connection will by default
     * be encrypted, allow a maximum of 10 pools, have a timeout value of 
     * 30 seconds, and not trust the server certificate.
     * 
     * @param {Object} options 
     * @return {Promise<ConnectionPool>}
     */
    async connectToMSSQL(options) {

        return new Promise((resolve, reject) => {

            console.log('  [MS SQL Database]: Preparing args for connection request');

            // If not all arguments received, reject
            if (!options.password || !options.user || !options.database || !options.server) {
                reject('INVALID_ARGS');
            }

            // Set pool & options to defaults if not provided
            if (!options.pool) {
                options.pool = {
                    max: 10,
                    min: 0,
                    idleTimeoutMillis: 30000
                }
            }

            if (!options.options && !options.trust === true) {
                options.options = {
                    encrypt: true,
                    trustServerCertificate: false // true only recommended if using your own server
                }
            } else if (options.trust === true) {
                options.options = {
                    encrypt: true,
                    trustServerCertificate: true // true only recommended if using your own server
                }
            }

            // Construct SQL Config object
            let sql = {
                user: options.user,
                password: options.password,
                database: options.database,
                server: options.server,
                pool: {
                    max: 10,
                    min: 0,
                    idleTimeoutMillis: 30000
                },
                options: {
                    encrypt: true,
                    trustServerCertificate: true // true only recommended if using your own server
                }
            }

            // Start connecting to the database
            console.log('  [MS SQL Database]: Requesting database connection');
            let pool = new ConnectionPool(sql);
            pool.connect().then(conPool => {
                console.log('  [MS SQL Database]: Connection established');
                resolve(conPool);
            })
            .catch(err => {
                console.log('  [MS SQL Database]: Connection failed:\n', err);
                reject('CONNECTION_ERR');
            })
        });
    },

    /**
     * Retrieves a connection to a MySQL server
     * 
     * @param {*} options 
     * @returns 
     */
    async connectToMySQL(options) {
        return new Promise((resolve, reject) => {

            // Check params
            console.log('  [MySQL Database]: ');
            if (!options.database || !options.username || !options.password) {
                reject('INVALID_ARGS');
            }

            // Create connection var and check for errors
            var con = createConnection(options);
            con.connect(err => {

                // Error check
                if (err) {
                    console.log('  [MySQL Database]: Error connecting to database');
                    reject('CONNECTION_ERR');
                }

                console.log('  [MySQL Database]: Connection established');
                resolve(con);

            });
        });
    },

    /**
     * 
     * @param {ConnectionPool} con 
     * @returns 
     */
    async tryReconnect(con) {
        return new Promise(async (resolve, reject) => {
            try {
                await con.connect();
                resolve(con);
            } catch (err) {
                reject("fail");
            }
        });
    }
}