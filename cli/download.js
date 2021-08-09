'use strict';

const YTDownloader = require('./index.js');
const downloader = new YTDownloader();

downloader.init('-url https://www.youtube.com/watch?v=_7unv8Z0oLw').then(instance => {
    downloader.download().then(result => {
        console.log(result);
    });
});