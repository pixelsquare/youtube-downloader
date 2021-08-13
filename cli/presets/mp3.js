'use strict'

exports.load = function(ffmpeg) {
    ffmpeg
        .format('mp3')
        .audioCodec('libmp3lame')
        .audioBitrate(192);
};