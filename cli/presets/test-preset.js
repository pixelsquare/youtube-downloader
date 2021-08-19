'use strict'

exports.load = function(ffmpeg) {
    ffmpeg
        .format('mp4')
        .videoCodec('libx264')
        .audioCodec('aac')
        .videoBitrate('1000000')
        .audioBitrate('128k')
        .size('3840x2160')
        .aspect('16:9')
        // .inputOptions(['-pass 2'])
        .outputOptions(['-bufsize 2M', '-r 24000/1001']);
        // .outputOptions(['-crf 23', '-preset medium']);
};