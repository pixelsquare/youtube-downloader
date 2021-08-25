'use strict'

exports.load = function(ffmpeg) {
    ffmpeg
        .format('mp4')
        .videoCodec('libx264')
        .audioCodec('aac')
        // .videoFilters(['fps=60'])
        .videoFilters(['scale=3840x2560:flags=lanczos'])
        .outputOptions(['-crf 21', '-preset slow']);
};