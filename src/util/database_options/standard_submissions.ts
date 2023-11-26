import stdSubDataJSON from './standard_submissions.json';
import ptrnSubDataJSON from './patreon_submissions.json';
const stdSubData = mapFromJSON(stdSubDataJSON);
const ptrnSubData = mapFromJSON(ptrnSubDataJSON);
import { writeFile } from 'fs';

export type DataEntry = {
    currentDateMillis: number,
    averageWeeksOld: number,
    averageDaysOld: number,
    numPosts: number,
    numEntries: number
}

class TempData {
    postAgeMillis: number[];
    referenceDate: Date;
    constructor() {
        this.postAgeMillis = [];
        this.referenceDate = new Date(Date.now());
    }

    addPostAge(millis: number) {
        this.postAgeMillis.push(millis);
    }

    averageAgeMillis() {
        let total = 0;
        for (let millis of this.postAgeMillis) {
            total += millis;
        }
        let average = total / this.postAgeMillis.length;
        return average;
    }

    averageAgeDays() {
        let days = Math.floor(this.averageAgeMillis() / (1000 * 60 * 60 * 24));
        return days;
    }

    averageAgeWeeks() {
        let weeks = Math.floor(this.averageAgeMillis() / (1000 * 60 * 60 * 24 * 7));
        return weeks
    }

    averageAgeDaysIntoCurrentWeek() {
        return this.averageAgeDays() % 7;
    }

    reset() {
        this.postAgeMillis = [];
    }
}

const stdTempData = new TempData();
const ptrTempData = new TempData();

export function addSpinData(numPosts: number, numEntries: number, type: String) {
    console.log(`[Data]: Logging Standard Submission Spin`);
    const date = new Date(Date.now());
    if (type === 'std_vod') {
        stdSubData.set(`${date.getMonth()}/${date.getDate()}/${date.getFullYear()}`, {
            currentDateMillis: Date.now(),
            averageWeeksOld: stdTempData.averageAgeWeeks(),
            averageDaysOld: stdTempData.averageAgeDays(),
            numPosts: numPosts,
            numEntries: numEntries
        });
        writeFile('./data/standard_submissions.json', mapToJSON(stdSubData), (err) => { if (err) console.error(err); });
    } else if (type === 'ptr_vod') {
        ptrnSubData.set(`${date.getMonth()}/${date.getDate()}/${date.getFullYear()}`, {
            currentDateMillis: Date.now(),
            averageWeeksOld: ptrTempData.averageAgeWeeks(),
            averageDaysOld: ptrTempData.averageAgeDays(),
            numPosts: numPosts,
            numEntries: numEntries
        });
        writeFile('./data/patreon_submissions.json', mapToJSON(ptrnSubData), (err) => { if (err) console.error(err); });
    }

}

export function logAllCollectedData() {
    const sortedStandardData = mapToSortedArray(stdSubData);
    const sortedPatreonData = mapToSortedArray(ptrnSubData);

    let buf: string[] = [];

    buf.push('[Data]: Logging All Data');
    buf.push('[Data]: Free VoD Forum Data:')
    for (const datum of sortedStandardData) {
        buf.push(`   [${datum[0]}]:\n      Posts: ${datum[1].numPosts
            }\n      Entries: ${datum[1].numEntries
            }\n      Average Post Age: ${datum[1].averageWeeksOld
            } weeks, ${datum[1].averageDaysOld % 7
            } days`);
    }

    buf.push('[Data]: Tier 3 Patreon VoD Forum Data:')
    for (const datum of sortedPatreonData) {
        buf.push(`   [${datum[0]}]:\n      Posts: ${datum[1].numPosts
            }\n      Entries: ${datum[1].numEntries
            }\n      Average Post Age: ${datum[1].averageWeeksOld
            } weeks, ${datum[1].averageDaysOld % 7
            } days`);
    }
    return buf.join('\n');
}

export function mapToJSON(map: Map<String, DataEntry>) {
    let str = '';
    for (const key of map) {
        const newEntry = `"${key[0]}":${JSON.stringify(map.get(key[0]))},`
        str = `${str}${newEntry}`;
    }
    str = `{${str.substring(0, str.length - 1)}}`;
    return str
}


export function mapFromJSON(json: Object) {
    return new Map<String, DataEntry>(Object.entries(json)) || new Map<String, DataEntry>();
}

function mapToSortedArray(map: Map<String, DataEntry>) {
    let buf = [];
    for (const entry of map.entries()) {
        buf.push(entry);
    }
    buf.sort((a, b) => {
        return a[1].currentDateMillis - b[1].currentDateMillis;
    });
    return buf;
}

module.exports = {
    stdTempData: stdTempData,
    ptrTempData: ptrTempData,
    addSpinData,
    logAllCollectedData,
    mapToJSON,
    mapFromJSON,
}