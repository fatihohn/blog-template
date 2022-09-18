'use strict';

import {FRONTLE_SYSTEM_PageLoader} from "./system/page/pageloader.js";
import {FRONTLE_SYSTEM_Import} from "./system/page/import.js";
import {FRONTLE_SYSTEM_ENV} from "./system/env/env.js";
import {FRONTLE_SYSTEM_Page} from "./system/page/page.js";

export class Frontle {
    static #pageLoader = new FRONTLE_SYSTEM_PageLoader();
    static #importInstance = new FRONTLE_SYSTEM_Import();

    // util
    static util = {
        pageMove: (pageClassName, params = {}, displayParamsInURL = true) => {
            this.#pageLoader.pageMove(pageClassName, params, displayParamsInURL);
        },
        pageReplace: (pageClassName, params = {}, displayParamsInURL = true) => {
            this.#pageLoader.pageReplace(pageClassName, params, displayParamsInURL);
        },
        pageBack: () => {
            this.#pageLoader.pageBack();
        },
        import: async (importObject) => {
            return this.#importInstance.asyncImport(importObject);
        },
    }

    // env
    static env = {
        get mode() {
            return FRONTLE_SYSTEM_ENV.mode;
        },
        get indexPage() {
            return FRONTLE_SYSTEM_ENV.indexPage;
        },
        set indexPage(value) {
            FRONTLE_SYSTEM_ENV.indexPage = String(value);
        },
    }

    // system
    static system = {
        start: (deviceReadyCallback = () => {}) => {
            let eventName = 'deviceready';
            if (String(typeof window.cordova) === "undefined") eventName = 'DOMContentLoaded';

            document.addEventListener(eventName, async () => {
                await deviceReadyCallback();
                new FRONTLE_SYSTEM_PageLoader().start();
            });
        },
        get page(){
            return FRONTLE_SYSTEM_Page;
        }
    }
}
