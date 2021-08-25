'use strict'

exports.load = function(ffmpeg) {
    ffmpeg
        .format('mp4')
        .videoCodec('libvpx-vp9')
        .audioCodec('aac')
        .videoFilters(['fps=8'])
        .outputOptions(['-crf 23', '-preset medium']);
};