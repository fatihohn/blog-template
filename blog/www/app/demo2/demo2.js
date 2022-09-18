'use strict';

import {Frontle} from "../../frontle/frontle.js"; // It contains all the functions of the Frontle

export class Demo2 extends Frontle.system.page {

    // Before HTML rendering
    awake() {
        console.log('awake demo2');

        // Received parameter output
        console.log(this.params.testParams);
    }

    // After HTML rendering
    async start() {
        console.log('start demo2');

        // Import files dynamically
        const result = await Frontle.util.import({
            subImageHtml: 'components/demo2Contents/demo2Contents.html'
        });

        // Add html to the root element
        document.querySelector('.rootPage').innerHTML = result.subImageHtml;
    }

    // Before leaving the page
    end() {
        console.log('end demo2');
    }

}
