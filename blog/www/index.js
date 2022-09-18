'use strict';

import {Frontle} from "./frontle/frontle.js";

// Start Frontle System
Frontle.system.start(() => {
    Frontle.env.indexPage = 'Demo1'; // Specify the first page to run

    console.log('Frontle Start!');
});
