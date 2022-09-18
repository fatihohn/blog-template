'use strict';

export class FRONTLE_SYSTEM_Util {
    static _instance = null;
    constructor() {
        if (FRONTLE_SYSTEM_Util._instance) return FRONTLE_SYSTEM_Util._instance;
        FRONTLE_SYSTEM_Util._instance = this;
    }

    // browser, android, ios, electron
    getPlatformId() {
        let result = '';

        // platform is browser
        if(location.href.substring(0, 4) === 'http'){
            // browser
            if(window.cordova === undefined) result = 'browser';
            // live reload
            else result = window.cordova.platformId;
        }
        // platform is cordova android or ios or electron
        else result = window.cordova.platformId;

        return result;
    }
}
