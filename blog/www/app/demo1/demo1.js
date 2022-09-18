'use strict';

import {Frontle} from "../../frontle/frontle.js"; // It contains all the functions of the Frontle

export class Demo1 extends Frontle.system.page {

    // Before HTML rendering
    awake() {
        console.log('awake demo1');
    }

    // After HTML rendering
    start() {
        console.log('start demo1');

        setTimeout(() => {
            // Go to Demo2 page
            Frontle.util.pageMove('Demo2', {
                testParams: 'test',
            });
        }, 5000);
    }

    // Before leaving the page
    end() {
        console.log('end demo1');
    }

}
