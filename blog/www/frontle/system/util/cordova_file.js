'use strict';

export class FRONTLE_SYSTEM_Cordova_file {
    static _instance = null;
    constructor() {
        if (FRONTLE_SYSTEM_Cordova_file._instance) return FRONTLE_SYSTEM_Cordova_file._instance;
        FRONTLE_SYSTEM_Cordova_file._instance = this;
    }

    async appFileRead(folder, fileName){
        try{
            const dirPath = `${window.cordova.file.applicationDirectory}www/${folder}`;

            const dirEntry = await this.getDirEntry(dirPath);
            const fileEntry = await this.getFileEntry(fileName, dirEntry, false);
            const fileData = await this.read(fileEntry);

            return String(fileData);
        } catch (e) {
            throw e;
        }
    }

    async getDirEntry(dir = window.cordova.file.dataDirectory) {
        return new Promise((resolve, reject) => {
            window.resolveLocalFileSystemURL(dir, (dirEntry) => {
                resolve(dirEntry);
            }, (error) => {
                reject(error);
            });
        });
    }

    async getFileEntry(fileName, dirEntry, create = true) {
        return new Promise((resolve, reject) => {
            dirEntry.getFile(fileName, { create: create, exclusive: false }, (fileEntry) => {
                resolve(fileEntry);
            }, (error) => {
                reject(error);
            });
        });
    }

    async read(fileEntry) {
        return new Promise((resolve, reject) => {
            try{
                fileEntry.file((file) => {
                    let reader = new FileReader();

                    reader.onloadend = (r) => {
                        resolve(String(r.target.result));
                    };

                    reader.readAsText(file);
                }, (e) => {
                    throw e;
                });
            } catch (e) {
                reject(e);
            }
        });
    }
}
