'use strict'

const fs = require('fs');
const path = require('path');

String.prototype.splice = function(idx, rem, str) {
    return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};

// # fluent-ffmpeg changes
const modulePath = path.resolve('node_modules/fluent-ffmpeg');

if(fs.existsSync(modulePath)) {
    const indexFile = path.join(modulePath, 'index.js');
    if(fs.existsSync(indexFile)) {
        var data = fs.readFileSync(indexFile, { encoding: 'utf-8', flag: 'r' }).toString();
        var fd = fs.openSync(indexFile, 'w+');
        data = data.replace('lib-cov', 'lib');
        fs.writeFileSync(fd, data, 'utf-8');
        fs.closeSync(fd);
        console.log('Fixed index.js');
    }

    const ffprobeFile = path.join(modulePath, 'lib/ffprobe.js');
    if(fs.existsSync(ffprobeFile)) {
        var data = fs.readFileSync(ffprobeFile, { encoding: 'utf-8', flag: 'r' }).toString();
        var fd = fs.openSync(ffprobeFile, 'w+');
        data = data.replace(/var spawn = require/g, "var spawn = window.require");
        fs.writeFileSync(fd, data, 'utf-8');
        fs.closeSync(fd);
        console.log('Fixed ffprobe.js');
    }

    const processorFile = path.join(modulePath, 'lib/processor.js');
    if(fs.existsSync(processorFile)) {
        var data = fs.readFileSync(processorFile, { encoding: 'utf-8', flag: 'r' }).toString();
        var fd = fs.openSync(processorFile, 'w+');
        data = data.replace(/var spawn = require/g, "var spawn = window.require");
        fs.writeFileSync(fd, data, 'utf-8');
        fs.closeSync(fd);
        console.log('Fixed processor.js');
    }

    const utilsFile = path.join(modulePath, 'lib/utils.js');
    if(fs.existsSync(utilsFile)) {
        var data = fs.readFileSync(utilsFile, { encoding: 'utf-8', flag: 'r' }).toString();
        var fd = fs.openSync(utilsFile, 'w+');    
        var idx = data.indexOf('var newLines = str.split');
        data = data.splice(idx, 0, `str = str.toString('utf-8');\n\t\t\t\t`);
        fs.writeFileSync(fd, data, 'utf-8');
        fs.closeSync(fd);
        console.log('Fixed utils.js');
    }

    const miscFile = path.join(modulePath, 'lib/options/misc.js');
    if(fs.existsSync(miscFile)) {
        var data = fs.readFileSync(miscFile, { encoding: 'utf-8', flag: 'r' }).toString();
        var fd = fs.openSync(miscFile, 'w+');
        data = data.replace(/var module = require/g, "var module = window.require");
        fs.writeFileSync(fd, data, 'utf-8');
        fs.closeSync(fd);
        console.log('Fixed misc.js');
    }
}
else {
    console.log('Library does not exist.')
}
