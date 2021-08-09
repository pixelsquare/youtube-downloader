'use strict'

exports.load = function(ffmpeg) {
    ffmpeg
        .format('mp4')
        .audioCodec('aac')
        .outputOptions(['-crf 23', '-preset medium']);
};