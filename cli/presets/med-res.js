'use strict'

exports.load = function(ffmpeg) {
    ffmpeg
        .format('mp4')
        .videoCodec('libx264')
        .audioCodec('aac')
        // .videoFilters(['fps=30'])
        .outputOptions(['-crf 23', '-preset medium']);
};