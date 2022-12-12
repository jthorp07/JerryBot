const {connectToMSSQL, connectToMySQL} = require('./connect-db');
const {checkPermissions} = require('./permission');
const Handlers = require('./handlers');

module.exports = {
    connectToMSSQL,
    connectToMySQL,
    checkPermissions,
    Handlers
}