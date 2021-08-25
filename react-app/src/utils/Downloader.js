const fs = window.require('fs');
const path = window.require('path');

const async = require('async');
const ffmpeg = require('fluent-ffmpeg');
const speedometer = require('speedometer')
const sanitize = require('sanitize-filename');

const downloader = require('./../lib/index.js');

export const getAvailableQuality = (info) => {
    return downloader.getAvailableQuality(info);
};

export const getURLInfo = async (url) => {
    return await downloader.getURLInfo(url);
};

var totalPercentage = 0;
var maxPercentage = 0;

const time = 1000; // Update time in milliseconds
var nextUpdate = Date.now() + time;

export const download = async (info, itag, progressCb) => {
    var result = {};
    var metadata = {};

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
            nextUpdate = Date.now() + time;
            
            stream.on('progress', (chunkSize, downloaded, total) => {
                progressData.totalDownloaded += parseInt(chunkSize);
                progressData.delta += parseInt(chunkSize);

                percentage = (downloaded / total) * 100;
                progressData.progress = percentage / maxPercentage;
                // console.log(percentage + ' ' + maxPercentage + ' ' + (percentage / maxPercentage));

                if(Date.now() >= nextUpdate) {
                    progressData.eta = Math.round(total - downloaded) / speed(progressData.delta);
                    progressData.speed = toMB(speed(progressData.delta));
                    progressCb(progressData);
                    progressData.delta = 0;
                    nextUpdate = Date.now() + time;
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
            nextUpdate = Date.now() + time;

            stream.on('progress', (chunkSize, downloaded, total) => {
                progressData.totalDownloaded += parseInt(chunkSize);
                progressData.delta += parseInt(chunkSize);

                percentage = (downloaded / total) * 100;
                progressData.progress = (totalPercentage + percentage) / maxPercentage;
                // console.log((totalPercentage + percentage) + ' ' + maxPercentage + ' ' + ((totalPercentage + percentage) / maxPercentage));

                if(Date.now() >= nextUpdate) {
                    progressData.eta = Math.round(total - downloaded) / speed(progressData.delta);
                    progressData.speed = toMB(speed(progressData.delta));
                    progressCb(progressData);
                    progressData.delta = 0;
                    nextUpdate = Date.now() + time;
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

    var title = info.videoDetails.title;

    await mergeMediaFiles(title, path.join(path.resolve('output')), metadata, progressCb);

    // result.filename = title;
    result.title = info.videoDetails.title;
    result.description = info.videoDetails.description;
    result.metadata = {
        author: info.videoDetails.author.name,
        likes: info.videoDetails.likes,
        viewCount: info.videoDetails.viewCount,
        subscriberCount: info.videoDetails.author.subscriber_count
    };

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

    var videoWidth, videoHeight, aspectRatio = 0;

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

    const progressData = {
        eta: -1,
        delta: 0,
        progress: 0,
        speed: 0,
        totalDownloaded: 0
    };


    const speed = speedometer(5000);
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

    process.on('progress', info => {
        const currentKbps = !isNaN(info.currentKbps) ? info.currentKbps : 0;
        const targetSize = !isNaN(info.targetSize) ? info.targetSize : 0;
        progressData.totalDownloaded += !isNaN(info.currentKbps) ? info.currentKbps : 0;
        progressData.delta = !isNaN(info.currentKbps) ? info.currentKbps : 0;

        percentage = info.percent;
        progressData.progress = (totalPercentage + percentage) / maxPercentage;
        // console.log((totalPercentage + percentage) + ' ' + maxPercentage + ' ' + ((totalPercentage + percentage) / maxPercentage));

        if(Date.now() >= nextUpdate) {
            // console.log(`delta: ${progressData.delta} ${speed(progressData.delta)}`);
            // progressData.eta = Math.round(currentKbps - targetSize) / speed(progressData.delta);
            progressData.speed = toMB(speed(currentKbps));
            progressCb(progressData);
            progressData.delta = 0;
            nextUpdate = Date.now() + time;
        }
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
            // console.log(progressData);
            resolve();
        });
    });

    await promise;
};