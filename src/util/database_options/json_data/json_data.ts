import { readFile } from "fs";

export function getJson(path: string) {
    let jsonObj;
    try {
        readFile(path, "utf8", (err, jsonData) => {
            if (err) return null;
            jsonObj = JSON.parse(jsonData);
        });
    } catch (err) {
        console.error(err);
        return null;
    }
    return jsonObj;
}