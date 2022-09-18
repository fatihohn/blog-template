'use strict';

import {FRONTLE_SYSTEM_Import} from "./import.js";
import {FRONTLE_SYSTEM_ENV} from "../env/env.js";

export class FRONTLE_SYSTEM_PageLoader {
    static _instance = null;
    constructor() {
        if (FRONTLE_SYSTEM_PageLoader._instance) return FRONTLE_SYSTEM_PageLoader._instance;
        FRONTLE_SYSTEM_PageLoader._instance = this;
    }

    // state params
    #params = {};
    #pageCount = 0;

    // page status
    #pageOpening = false;
    #pageInstance = null;

    #firstSetStateEvent = true;

    // import
    #importInstance = new FRONTLE_SYSTEM_Import();

    // start
    start() {
        // parse params
        const params = this.#parseURL();

        // make state
        const state = Object.assign(params, {
            f_p: params.f_p || FRONTLE_SYSTEM_ENV.indexPage,
            f_u: params.f_u || true,
            f_c: Number(params.f_c) || 0
        });

        // page open
        this.#pageOpen('replace', state);
    }

    // page open
    async #pageOpen(stateSaveType, state) {
        try {
            // check page opening
            if(this.#pageOpening) return;

            // start page opening
            this.#pageOpening = true;

            // run lifecycle
            if(this.#pageInstance !== null) await this.#pageInstance.end();

            // get state URL
            const stateURL = this.#stateURL(state);

            // get state parameters
            this.#params = state;
            this.#pageCount = this.#params.f_c;

            // set state
            switch (stateSaveType){
                case 'push':
                    history.pushState(state, null, stateURL);
                    break;
                case 'replace':
                    history.replaceState(state, null, stateURL);
                    break;
            }

            // set state pop and push event
            this.#setStateEvent();

            // get page class, path name
            const pageClassName = this.#params.f_p.replace(/[^a-zA-Z0-9_]/gi, '');
            const pagePathName = pageClassName.toLowerCase();

            // page open
            import(`./../../../app/${pagePathName}/${pagePathName}.js`).then(_route => {
                // filter params
                let filteredParams = JSON.parse(JSON.stringify(this.#params));
                if(filteredParams.f_p !== undefined) delete filteredParams.f_p;
                if(filteredParams.f_u !== undefined) delete filteredParams.f_u;
                if(filteredParams.f_c !== undefined) delete filteredParams.f_c;

                // get page instance
                this.#pageInstance = eval(`new _route.${pageClassName}(filteredParams)`);

                // set html path
                const importObject = {
                    [pagePathName]: `app/${pagePathName}/${pagePathName}.html`,
                };

                // get html
                this.#importInstance.import(importObject, async (result) => {
                    // get app element
                    const appElement = document.getElementById('app');

                    // reset page
                    await this.#pageReset(appElement);

                    // stop page opening
                    this.#pageOpening = false;

                    // run lifecycle
                    await this.#pageInstance.awake();

                    // check page opening
                    if(this.#pageOpening) return;

                    // set html
                    appElement.innerHTML = `<div id="${pageClassName}" class="rootPage">${result[pagePathName]}</div>`;

                    // run lifecycle
                    this.#pageInstance.start();
                });
            });
        } catch (e) {
            console.log('page not found: ' + JSON.stringify(e));
        }
    }

    // page change by state
    #setStateEvent() {
        // loading once
        if(this.#firstSetStateEvent === false) return;
        this.#firstSetStateEvent = false;

        window.onpopstate = (event) => {
            // get state
            const state = event.state;

            // get changed page count
            const changedPageCount = Number(state.f_c);

            // if push state
            if(changedPageCount > this.#pageCount) this.#pushState(state);
            // if pop state
            else if(changedPageCount < this.#pageCount) this.#popState(state);
            // error
            else throw { type: 'system', message: 'invalid page count' };
        }
    }
    #pushState(state) {
        if(this.#pageOpening) history.back();
        else this.#pageOpen('replace', state);
    }
    #popState(state) {
        if(this.#pageOpening) history.pushState(this.#params, null);
        else this.#pageOpen('replace', state);
    }

    // page change by util
    pageMove(pageClassName, params = {}, displayParamsInURL = true) {
        // make state
        const state = Object.assign(params, {
            f_p: pageClassName,
            f_u: displayParamsInURL,
            f_c: this.#pageCount + 1
        });

        // page open
        this.#pageOpen('push', state);
    }
    pageReplace(pageClassName, params = {}, displayParamsInURL = true) {
        // make state
        const state = Object.assign(params, {
            f_p: pageClassName,
            f_u: displayParamsInURL,
            f_c: this.#pageCount
        });

        // page open
        this.#pageOpen('replace', state);
    }
    pageBack() {
        history.back();
    }

    // util
    #parseURL() {
        let params = {};
        window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str, key, value) {
            params[decodeURIComponent(key)] = decodeURIComponent(value);
        });

        return params;
    }
    #stateURL(params) {
        let urlParams = '';
        if(Boolean(params.f_u) === true) urlParams = this.#paramsToURLString(params);

        return `${location.protocol}//${location.host}${location.pathname}/../index.html?f_p=${params.f_p}&f_u=${params.f_u}&f_c=${params.f_c}${urlParams}`;
    }
    #paramsToURLString(params = {}) {
        let urlParams = '';

        const keys = Object.keys(params);
        for(let i = 0; i < keys.length; i++){
            const key = keys[i];
            const value = params[key];

            switch (key.toLocaleLowerCase()){
                case 'f_p':
                case 'f_u':
                case 'f_c':
                    continue;
            }

            urlParams += `&${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
        }

        return urlParams;
    }
    #pageReset(appElement) {
        // reset html
        appElement.innerHTML = '';

        // reset scroll
        window.scroll({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    }
}
