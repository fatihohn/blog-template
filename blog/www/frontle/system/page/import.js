'use strict';

import {FRONTLE_SYSTEM_Util} from "../util/frontleUtil.js";
import {FRONTLE_SYSTEM_Cordova_file} from "../util/cordova_file.js";
import {FRONTLE_SYSTEM_ENV} from "../env/env.js";

export class FRONTLE_SYSTEM_Import {
    static _instance = null;
    constructor() {
        if (FRONTLE_SYSTEM_Import._instance) return FRONTLE_SYSTEM_Import._instance;
        FRONTLE_SYSTEM_Import._instance = this;
    }

    #cache = {};
    #frontleUtil = new FRONTLE_SYSTEM_Util();
    #cordovaFile = new FRONTLE_SYSTEM_Cordova_file();

    import(importObject, callback) {
        switch (this.#frontleUtil.getPlatformId().toLowerCase()) {
            case 'browser':
            case 'electron':
                this.#browserImport(importObject, callback);
                break;
            default:
                this.#appImport(importObject, callback);
                break;
        }
    }

    async asyncImport(importObject){
        return new Promise((resolve, reject) => {
            try{
                this.import(importObject, (result) => {
                    resolve(result);
                });
            } catch (e) {
                reject(e);
            }
        })
    }

    #browserImport(importObject, callback){
        let result = {};
        let callbackRunStatus = true;
        const keys = Object.keys(importObject);

        const complete = (key, path, html) => {
            this.#cache[path] = html;

            this.#browserRecursive(this.#cache[path], (finalHTML) => {
                result[key] = finalHTML;

                if (Object.keys(result).length === keys.length) {
                    if(callbackRunStatus === false) return;
                    callbackRunStatus = false;
                    callback(result);
                }
            });
        };

        keys.forEach(key => {
            const path = importObject[key];

            if(this.#cache[path] === undefined){
                let x = new XMLHttpRequest();
                x.onreadystatechange = () => {
                    if(x.readyState !== 4) return;

                    const html = x.status === 200 ? x.responseText : `${path} is not found.`;
                    complete(key, path, html);
                };
                x.open('GET', `${path}?v=${FRONTLE_SYSTEM_ENV.hash}`, true);
                x.send();
            } else {
                complete(key, path, this.#cache[path]);
            }
        });
    }

    #browserRecursive(html, callback) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(`<body>${html}</body>`, 'text/html');
        let completeCount = 0;

        const complete = (element, path, resultHTML, allElementsLength) => {
            this.#cache[path] = resultHTML;
            element.innerHTML = this.#cache[path];
            element.removeAttribute('import');

            completeCount++;
            if(allElementsLength === completeCount) {
                completeCount = 0;
                recursive();
            }
        };

        const recursive = () => {
            const allElements = doc.querySelectorAll('[import]');
            if(allElements.length < 1) {
                callback(doc.body.innerHTML);
                return;
            }

            const allElementsLength = allElements.length;
            for(let i = 0; i < allElementsLength; i++){
                const element = allElements[i];
                const path = element.getAttribute('import');

                if(this.#cache[path] !== undefined) {
                    complete(element, path, this.#cache[path], allElementsLength);
                    continue;
                }

                let x = new XMLHttpRequest();
                x.onreadystatechange = () => {
                    if(x.readyState !== 4) return;

                    const resultHTML = x.status === 200 ? x.responseText : `${path} is not found.`;
                    complete(element, path, resultHTML, allElementsLength);
                };
                x.open('GET',  path, true);
                x.send();
            }
        };
        recursive();
    }


    #appImport(importObject, callback){
        let result = {};
        let callbackRunStatus = true;
        const keys = Object.keys(importObject);

        const complete = async (key, path, html) => {
            this.#cache[path] = html;
            result[key] = await this.#appRecursive(this.#cache[path]);

            if (Object.keys(result).length === keys.length) {
                if(callbackRunStatus === false) return;
                callbackRunStatus = false;
                callback(result);
            }
        };

        keys.forEach(async key => {
            const path = importObject[key];
            const { folderName, fileName } = this.#getFileAndFolderName(path);

            let html = null;
            if(this.#cache[path] === undefined){
                try{
                    html = await this.#cordovaFile.appFileRead(folderName, fileName);
                } catch (e){
                    html = 'Page not found.';
                }
            } else {
                html = this.#cache[path];
            }
            await complete(key, path, html);
        });
    }

    async #appRecursive(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(`<body>${html}</body>`, 'text/html');

        const complete = (element, path, resultHTML) => {
            this.#cache[path] = resultHTML;
            element.innerHTML = this.#cache[path];
            element.removeAttribute('import');
        };

        const recursive = async () => {
            const allElements = doc.querySelectorAll('[import]');
            for(let i = 0; i < allElements.length; i++){
                const element = allElements[i];
                const path = element.getAttribute('import');

                let resultHTML = null;
                if(this.#cache[path] === undefined){
                    try{
                        const { folderName, fileName } = this.#getFileAndFolderName(path);
                        resultHTML = await this.#cordovaFile.appFileRead(folderName, fileName);
                    } catch (e){
                        resultHTML = `${path} is not found.`;
                    }
                } else {
                    resultHTML = this.#cache[path];
                }
                complete(element, path, resultHTML);
            }

            if(doc.querySelectorAll('[import]').length < 1) {
                return doc.body.innerHTML;
            } else {
                return await recursive();
            }
        };
        return await recursive();
    }

    #getFileAndFolderName(path) {
        let folderName = '';
        let fileName  = '';
        let pathSplitArray = path.split('/');
        for (let i = 0; i < pathSplitArray.length; i++){
            if(i + 1 !== pathSplitArray.length) folderName += pathSplitArray[i] + '/';
            else fileName = pathSplitArray[i];
        }

        if(fileName.indexOf('?') !== -1) fileName = fileName.split('?')[0];

        return { folderName: folderName, fileName: fileName };
    }
}
