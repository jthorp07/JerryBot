// Script to run all SQL scripts and build the database -- Should only run once
const { SQL_ADMIN } = require("../config.json");
const { ConnectionPool } = require("mssql");
const fs = require("fs");
const { exit } = require("process");


let queries = [];

/*
 * Process:
 *  - Connect to database
 *  - Read data from the following directories:
 *    - Tables
 *    - Procedures
 *    - Datatypes?
 *  - Query DB to CREATE TABLEs
 *    
 * 
 */
cdbLog("Initializing");
cdbLog("Starting Database Connection");
dbLog("Requesting Database Connection");
let con = new ConnectionPool(SQL_ADMIN);
con.connect().then(con => {
    dbLog("Connection Established");
}).catch(err => {
    eLog(dbLog, "Database Connection Failed", err);
    exit(1);
});

cdbLog("Reading in SQL Scripts");

/*
    ========================================================================
    Tables
    ========================================================================
*/

readLog("Reading in Table Scripts");

let tables = fs.readdirSync("./Tables");
tables.forEach(table => {
    tableLog(`Read table ${table}`);
});
tableLog("Done reading tables");

/*
    ========================================================================
    Procedures
    ========================================================================
*/

readLog("Reading in Procedure Scripts");

let procs = fs.readdirSync("./Procedures");
procs.forEach(proc => {
    procLog(`Read procedure ${proc}`);
});
procLog("Done reading procedures");

/*
    ========================================================================
    Adding Queries
    ========================================================================
*/
tables.forEach(table => {

    fs.readFileSync(`Tables/${table}`).toString().split(';').forEach(query => {
        queries.push(query);
        queryLog(query);
    });

});

procs.forEach(proc => {
    fs.readFileSync(`Procedures/${proc}`).toString().split(';').forEach(query => {
        queries.push(query.concat(';'));
        queryLog(query);
    });
})


/*
    ========================================================================
    Logging Functions
    ========================================================================
*/
function cdbLog(text) {
    console.log(`[Create-DB]: ${text}`);
}

function dbLog(text) {
    console.log(`  [Database]: ${text}`);
}

function readLog(text) {
    console.log(`  [Scripts]: ${text}`);
}

function tableLog(text) {
    console.log(`    [Tables]: ${text}`);
}

function procLog(text) {
    console.log(`    [Procedures]: ${text}`);
}

/** @param {string} text */
function queryLog(text) {

    console.log(`  [Queries]: Added query [${text}]`);
}

function eLog(logger, text, errorJSON) {
    let logText = `Error: ${text}\n\nABORTING: Check error.json for details`;
    logger(logText);
    fs.writeFile("./error.json", JSON.stringify(errorJSON), err => {
        if (err) console.log(err);
        exit(1);
    });
}