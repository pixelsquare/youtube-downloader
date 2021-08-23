'use strict'

const fs = require('fs');
const path = require('path');

const bundlePath = path.resolve('src/js/bundle.js');

if(fs.existsSync(bundlePath)) {
    var text = fs.readFileSync(bundlePath, { encoding: 'utf-8', flag: 'r' });
    text = text.replace(/var spawn = require/g, "var spawn = window.require");

    fs.writeFileSync(bundlePath, text, 'utf-8', err => {
        if(err) console.log(err);
    });
}