'use strict'

const fs = require('fs');
const path = require('path');

const bundlePath = path.resolve('src/js/bundle.js');

String.prototype.splice = function(idx, rem, str) {
    return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};

if(fs.existsSync(bundlePath)) {
    var data = fs.readFileSync(bundlePath, { encoding: 'utf-8', flag: 'r' }).toString();
    var fd = fs.openSync(bundlePath, 'w+');

    // Mod #1: Replace all spawn require with window.require
    data = data.replace(/var spawn = require/g, "var spawn = window.require");

    // Mod #2: Fixed an error when executing a command process getting a buffer instead of a string
    var idx = data.indexOf('var newLines = str.split');
    data = data.splice(idx, 0, `str = str.toString('utf-8');\n\t\t\t\t`);

    fs.writeFileSync(fd, data, 'utf-8', err => {
        if(err) console.log(err);
    });

    fs.closeSync(fd);
}