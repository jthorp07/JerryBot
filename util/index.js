const {connectToMSSQL, connectToMySQL} = require('./connect-db');
const {checkPermissions} = require('./permission');

module.exports = {
    connectToMSSQL,
    connectToMySQL,
    checkPermissions
}