'use strict'

exports.load = function(ffmpeg) {
    ffmpeg
        .format('mp4')
        .videoCodec('libx264')
        .audioCodec('aac')
        .videoFilters(['fps=60'])
        .outputOptions(['-crf 21', '-preset slow']);
};