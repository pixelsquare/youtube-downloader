const fs = window.require('fs');
const path = window.require('path');

const async = require('async');
const ffmpeg = require('fluent-ffmpeg');
const speedometer = require('speedometer')
const sanitize = require('sanitize-filename');
const moment = require('moment');

const downloader = require('./../lib/index.js');

export const getAvailableQuality = (info) => {
    return downloader.getAvailableQuality(info);
};

export const getURLInfo = async (url) => {
    return await downloader.getURLInfo(url);
};

var willStopDownload = false;
export const stopDownload = () => {
    willStopDownload = true;
};

var totalPercentage = 0;
var maxPercentage = 0;

const timeMs = 1000;
var nextUpdate = Date.now() + timeMs;

export const download = async (info, itag, progressCb) => {
    var result = {};
    var metadata = {};
    willStopDownload = false;

    const progressData = {
        eta: 0,
        delta: 0,
        progress: 0,
        speed: 0,
        totalDownloaded: 0
    };

    var speed = speedometer(5000);
    const toMB = i => (parseInt(i) / 1024 / 1024).toFixed(2); // Byte to KB to MB

    metadata.title = info.videoDetails.media.song || info.videoDetails.title;
    metadata.artist = info.videoDetails.media.artist;
    metadata.author = info.videoDetails.author.name;
    metadata.description = info.videoDetails.description;

    if(!fs.existsSync(path.join(path.resolve('output')))) {
        fs.mkdirSync(path.join(path.resolve('output')));
    }

    const tasks = [
        async (cb) => {
            const stream = await downloader.download(info, { quality: 'highestaudio' });
            stream.pipe(fs.createWriteStream(path.join(path.resolve('output'), sanitize('a.mp4'))));

            var percentage = 0;
            nextUpdate = Date.now() + timeMs;
            
            stream.on('progress', (chunkSize, downloaded, total) => {
                progressData.totalDownloaded += parseInt(chunkSize);
                progressData.delta += parseInt(chunkSize);

                percentage = (downloaded / total) * 100;
                progressData.progress = percentage / maxPercentage;
                // console.log(percentage + ' ' + maxPercentage + ' ' + (percentage / maxPercentage));

                if(willStopDownload && !stream.destroyed) {
                    stream.destroy();
                }

                if(Date.now() >= nextUpdate) {
                    progressData.eta = (Math.round(total - downloaded) / speed(progressData.delta));
                    progressData.speed = toMB(speed(progressData.delta));
                    progressCb(progressData);
                    progressData.delta = 0;
                    nextUpdate = Date.now() + timeMs;
                }
            });

            stream.on('data', data => {});

            stream.on('error', err => {
                const error = {
                    message: 'An error occured while downloading the audio file.',
                    error: err,
                    payload: ''
                }

                return Promise.reject(error);
            });

            var promise = new Promise((resolve) => {
                stream.on('end', () => {
                    totalPercentage = percentage;
                    progressCb(progressData);
                    resolve();
                });

            });

            await promise;
            cb(null, 'Audio download complete!');
        },
        async (cb) => {
            const stream = await downloader.download(info, { quality: itag ? itag : 'highestvideo' });
            stream.pipe(fs.createWriteStream(path.join(path.join(path.resolve('output')), sanitize('v.mp4'))));

            var percentage = 0;
            nextUpdate = Date.now() + timeMs;

            stream.on('progress', (chunkSize, downloaded, total) => {
                progressData.totalDownloaded += parseInt(chunkSize);
                progressData.delta += parseInt(chunkSize);

                percentage = (downloaded / total) * 100;
                progressData.progress = (totalPercentage + percentage) / maxPercentage;
                // console.log((totalPercentage + percentage) + ' ' + maxPercentage + ' ' + ((totalPercentage + percentage) / maxPercentage));

                if(willStopDownload && !stream.destroyed) {
                    stream.destroy();
                }

                if(Date.now() >= nextUpdate) {
                    progressData.eta = (Math.round(total - downloaded) / speed(progressData.delta));
                    progressData.speed = toMB(speed(progressData.delta));
                    progressCb(progressData);
                    progressData.delta = 0;
                    nextUpdate = Date.now() + timeMs;
                }
            });

            stream.on('data', data => {});

            stream.on('error', err => {
                const error = {
                    message: 'An error occured while downloading the video file.',
                    error: err,
                    payload: ''
                }

                return Promise.reject(error);
            });

            const promise = new Promise((resolve) => {
                stream.on('end', () => {
                    totalPercentage += percentage;
                    progressCb(progressData);
                    resolve();
                });
            });

            await promise;
            cb(null, 'Video download complete!');
        }
    ];

    maxPercentage = 100 + (tasks.length * 100);

    await async.series(tasks);

    if(willStopDownload) {
        return result;
    }

    var title = info.videoDetails.title;

    await mergeMediaFiles(title, path.resolve('output'), metadata, progressCb);

    const outputPath = path.join(__dirname, 'output', sanitize(title + '.mp4'));
    const outPromise = new Promise((resolve, reject) => {
        ffmpeg.ffprobe(outputPath, (err, data) => {
            if(err) {
                const error = {
                    function: 'download',
                    error: err,
                    message: err.message,
                    payload: outputPath
                };

                return reject(error);
            }
            
            const audio = data.streams.filter(filter => filter.codec_type === 'audio')[0];
            const video = data.streams.filter(filter => filter.codec_type === 'video')[0];

            result.outputPath = data.format.filename;

            if(audio) {
                result.audioInfo = {
                    codec: audio.codec_name,
                    channels: audio.channels,
                    channelLayout: audio.channel_layout,
                    duration: audio.duration,
                    bitrate: audio.bit_rate,
                    encoding: audio.tags.encoder
                };
            }

            if(video) {
                result.videoInfo = {
                    codec: video.codec_name,
                    width: video.width,
                    height: video.height,
                    aspectRatio: video.display_aspect_ratio,
                    size: toMB(data.format.size) + ' MB',
                    duration: data.format.duration,
                    bitrate: video.bit_rate,
                    fps: video.r_frame_rate
                };
            }

            resolve(result);
        });
    });

    result.filename = title;
    result.title = info.videoDetails.title;
    result.description = info.videoDetails.description;
    result.metadata = {
        author: info.videoDetails.author.name,
        likes: info.videoDetails.likes,
        viewCount: info.videoDetails.viewCount,
        subscriberCount: info.videoDetails.author.subscriber_count
    };

    await outPromise;
    return result;  
};

const mergeMediaFiles = async (title, outPath, metadata, progressCb) => {
    const presetsPath = path.resolve('presets');
    const ffmpegPath = path.resolve('../ffmpeg/bin/ffmpeg.exe');
    const ffmpegProbePath = path.resolve('../ffmpeg/bin/ffprobe.exe');

    ffmpeg.setFfmpegPath(ffmpegPath);
    ffmpeg.setFfprobePath(ffmpegProbePath);

    const videoPath = path.join(outPath, 'v.mp4');
    const audioPath = path.join(outPath, 'a.mp4');
    const outputPath = path.join(outPath, sanitize(title + '.mp4'));

    var videoWidth = 0;
    var videoHeight = 0;
    var aspectRatio = 0;
    var videoSize = 0;
    var videoDuration = 0;

    const videoPromise = new Promise((resolve) => {
        ffmpeg.ffprobe(videoPath, (err, data) => {
            if(err) {
                const error = {
                    function: 'mergeMediaFiles',
                    message: err.message,
                    error: err,
                    payload: ''
                }

                return Promise.reject(error);
            }

            if(data.format) {
                videoSize = data.format.size;
                videoDuration = data.format.duration;
            }

            const video = data.streams.filter(filter => filter.codec_type === 'video')[0];

            if(video) {
                videoWidth = video.width;
                videoHeight = video.height;
                aspectRatio = video.display_aspect_ratio;
            }

            resolve(data);
        });
    });

    await videoPromise;

    var audioSize = 0;
    var audioDuration = 0;

    const audioPromise = new Promise((resolve) => {
        ffmpeg.ffprobe(audioPath, (err, data) => {
            if(err) {
                const error = {
                    function: 'mergeMediaFiles',
                    message: err.message,
                    error: err,
                    payload: ''
                }

                return Promise.reject(error);
            }

            if(data.format) {
                audioSize = data.format.size;
                audioDuration = data.format.duration;
            }

            resolve(data);
        });
    });

    await audioPromise;

    const progressData = {
        eta: 0,
        delta: 0,
        progress: 0,
        speed: 0,
        totalDownloaded: 0
    };


    const speed = speedometer(20000);
    const toMB = i => (parseInt(i) / 1024).toFixed(2); // KB to MB

    const process = ffmpeg({
        presets: presetsPath
    });

    process.addInput(videoPath);
    process.addInput(audioPath);
    process.preset('mid-res');
    
    process.withSize(`${videoWidth}x${videoHeight}`);
    process.withAspect(aspectRatio);

    const outputOptions = [
        '-id3v2_version', '4',
        '-metadata', `title=${metadata.title}`,
        '-metadata', `artist=${metadata.artist}`,
        '-metadata', `author=${metadata.author}`,
        '-metadata', `description=${metadata.description}`,
    ];

    process.outputOptions(...outputOptions);

    // process.on('start', command => {
    //     console.log(command);
    //     // cliprogress.start(100, 0, { filename: title, speed: "N/A" });
    // });

    // process.on('codecData', data => {
    //     console.log(data);
    // });

    // process.on('stderr', info => {
    //     console.log(info);
    // });

    var percentage = 0;

    const audioDurationMs = audioDuration * 1000;
    const videoDurationMs = videoDuration * 1000;
    const totalDurationMs = Math.max(audioDurationMs, videoDurationMs);

    var oldTimeMs = 0;
    var deltaTimeMs = 0;

    process.on('progress', info => {
        const currentKbps = !isNaN(info.currentKbps) ? info.currentKbps : 0;
        const targetSize = !isNaN(info.targetSize) ? info.targetSize : 0;

        progressData.totalDownloaded += !isNaN(info.currentKbps) ? info.currentKbps : 0;

        percentage = info.percent;
        progressData.progress = (totalPercentage + percentage) / maxPercentage;
        // console.log((totalPercentage + percentage) + ' ' + maxPercentage + ' ' + ((totalPercentage + percentage) / maxPercentage));

        var timemarkMs = moment(info.timemark, 'HH:mm:ss.SSS').diff(moment().startOf('day'), 'milliseconds');
        deltaTimeMs = timemarkMs - oldTimeMs;
        progressData.delta += deltaTimeMs;

        if(willStopDownload) {
            process.kill('SIGKILL');
            return Promise.reject('Aborted');
        }
        
        if(Date.now() >= nextUpdate) {
            progressData.eta = progressData.delta > 0 ? (Math.round(totalDurationMs - timemarkMs) / speed(progressData.delta)) * 10: 0;
            progressData.speed = toMB(speed(currentKbps));
            progressCb(progressData);
            progressData.delta = 0;
            nextUpdate = Date.now() + timeMs;
        }

        oldTimeMs = timemarkMs;
    });

    process.saveToFile(outputPath);

    var promise = new Promise((resolve, reject) => {
        process.on('error', (err, stdout, stderr) => {
            if(err) {
                const error = {
                    message: 'An error occured while merging files.',
                    error: err,
                    payload: ''
                }

                reject(error);
            }
        });
        
        process.on('end', (stdout, stderr) => {
            totalPercentage += percentage;
            progressCb(progressData);
            resolve();
        });
    });

    await promise;
};