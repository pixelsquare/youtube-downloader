'use strict';

const path = require('path');
const YTDownloader = require('./index.js');
const downloader = new YTDownloader();

downloader.init('-url https://www.youtube.com/watch?v=_7unv8Z0oLw -o ' + path.join(__dirname, '/output'));
downloader.download('https://www.youtube.com/watch?v=_7unv8Z0oLw', function(result) {
    console.log(result);
});
// downloader.chooseFormat('https://www.youtube.com/watch?v=_7unv8Z0oLw');