'use strict'

const fs = require('fs');
const path = require('path');
const lodash = require('lodash');
const async = require('async');
const chalk = require('chalk');
const prompts = require('prompts');
const ffmpeg = require('fluent-ffmpeg');
const speedometer = require('speedometer');
const sanitize = require('sanitize-filename');
const truncate = require('smart-truncate');

const { exec } = require('child_process');
const { SingleBar, Presets } = require('cli-progress');
const downloader = require('./lib/index.js');

class YoutubeDownloader {

    constructor(options) {
        this.options = lodash.merge(YoutubeDownloader.default, options);
        // console.log(this.options);

        this.totalPercentage = 0;
        this.cliprogress = new SingleBar({ 
            format: '{bar} {percentage}% | {filename} | ETA: {eta}s | {speed} Mb/s', 
            clearOnComplete: false, 
            hideCursor: true 
        }, 
        Presets.shades_classic);
    }

    download() {
        const self = this;

        if(fs.existsSync(self.options.outputPath)) {
            return self.downloadAsync(this.options);
        }

        const error = { 
            function: 'download', 
            message: 'File does not exist.', 
            payload: self.options.outputPath
        };

        return Promise.reject(error);
    }

    static get default() {
        return {
            url: null,
            title: null,
            outputPath: path.resolve('output'),
            quality: '720p',
            ext: 'mp4',
            preset: 'mid-res',
            isMp3: false
        };
    }

    async downloadAsync(options) {
        const self = this;

        var result = { url: options.url };
        var metadata = {};
        var info = null;

        try {
            info = await downloader.getURLInfo(options.url);
        }
        catch(err) {
            const error = { 
                function: 'downloadAsync', 
                message: 'Failed to get info from URL', 
                payload: err.message
            };

            return Promise.reject(error);
        }

        // Get quality list
        const qualityList = downloader.getAvailableQuality(info);

        // Create prompt choices
        var choices = [];
        qualityList.forEach(i => {
            choices.push({ title: i.quality, value: i.itag });
        })

        if(self.options.quality && !qualityList.some(e => e.quality === self.options.quality)) {
            console.log('\n' + chalk.bgRed.bold(`Selected video quality does not exist. "${self.options.quality}"`));
            const response = await prompts({
                type: 'select',
                name: 'qualityResponse',
                message: `Please select quality:`,
                choices: choices
            });

            self.options.quality = response.qualityResponse;
        }
        else {
            // Convert string quality to itag number
            self.options.quality = qualityList.filter(filter => filter.quality === self.options.quality)[0].itag;
        }

        metadata.title = info.videoDetails.media.song || info.videoDetails.title;
        metadata.artist = info.videoDetails.media.artist;
        metadata.author = info.videoDetails.author.name;
        metadata.description = info.videoDetails.description;

        const tasks = [
            async function() {
                const stream = await downloader.download(info, { quality: 'highestaudio' });
                stream.pipe(fs.createWriteStream(path.join(self.options.outputPath, sanitize('a.mp4'))));

                var percentage = 0;
                stream.on('progress', (chunkSize, downloaded, total) => {
                    totalDownloaded += parseInt(chunkSize);
                    delta += parseInt(chunkSize);

                    percentage = (totalDownloaded / total) * 100;

                    if(Date.now() >= nextUpdate) {
                        eta = Math.round(total - downloaded) / speed(chunkSize);
                        self.cliprogress.update(parseInt(percentage), {
                            speed: toMB(speed(delta)),
                            eta: eta
                        });

                        delta = 0;
                        nextUpdate = Date.now() + time;
                    }
                });

                var promise = new Promise((resolve) => {
                    stream.on('end', () => {
                        self.totalPercentage = percentage;
                        // Update progress bar's final tick at 100%
                        self.cliprogress.update(parseInt(self.totalPercentage), {
                            speed: 0,
                            eta: 0
                        });
                        resolve();
                    });

                });

                await promise;
            },
            async function() {
               const stream = await downloader.download(info, { quality: self.options.quality ? self.options.quality : 'highestvideo' });
               stream.pipe(fs.createWriteStream(path.join(self.options.outputPath, sanitize('v.mp4'))));

                var percentage = 0;
                stream.on('progress', (chunkSize, downloaded, total) => {
                    totalDownloaded += parseInt(chunkSize);
                    delta += parseInt(chunkSize);

                    percentage = (totalDownloaded / total) * 100;

                    if(Date.now() >= nextUpdate) {
                        eta = Math.round(total - downloaded) / speed(chunkSize);
                        self.cliprogress.update(Math.round(self.totalPercentage + parseInt(percentage)), {
                            speed: toMB(speed(delta)),
                            eta: eta
                        });

                        delta = 0;
                        nextUpdate = Date.now() + time;
                    }
                });

                const promise = new Promise((resolve) => {
                    stream.on('end', () => {
                        self.totalPercentage += percentage;
                        // Update progress bar's final tick at 100%
                        self.cliprogress.update(parseInt(self.totalPercentage), {
                            speed: 0,
                            eta: 0
                        });
                        resolve();
                    });
                });

                await promise;
            }
        ];

        if(self.options.isMp3) {
            tasks.splice(1, 1); // Remove video file when we only want audio clip
        }

        var eta = 0;
        var delta = 0;
        var speed = speedometer(5000);
        const toMB = i => (parseInt(i) / 1024 / 1024).toFixed(2); // Byte to KB to MB

        var totalDownloaded = 0;
        const totalLength = 100 + (tasks.length * 100);

        const time = 300; // Update time in milliseconds
        var nextUpdate = Date.now() + time;

        self.cliprogress.start(totalLength, self.totalPercentage, { filename: truncate(info.videoDetails.title, 20, { position: 21}), speed: "N/A" });

        await async.series(tasks);

        var title = self.options.title || info.videoDetails.title;
        const outputPath = path.join(self.options.outputPath, sanitize(title + '.' + self.options.ext));

        await self.mergeMediaFiles(title, metadata);

        const ffprobePath = path.resolve('../ffmpeg/bin/ffprobe.exe');
        const command = `${ffprobePath} -v quiet -print_format json -show_format -show_streams "${outputPath}"`;
        
        const promise = new Promise((resolve) => {
            exec(command, (err, stdout, stderr) => {
                if(err) {
                    console.log('\n' + chalk.red.bold(err));
                    resolve();
                    return;
                }
    
                const videoDetails = JSON.parse(stdout);
    
                const audio = videoDetails.streams.filter(filter => filter.codec_type === 'audio')[0];
                const video = videoDetails.streams.filter(filter => filter.codec_type === 'video')[0];
    
                result.outputPath = videoDetails.format.filename;

                if(self.options.isMp3) {
                    result.info = {
                        codec: audio.codec_name,
                        channels: audio.channels,
                        channelLayout: audio.channel_layout,
                        duration: audio.duration,
                        bitrate: audio.bit_rate,
                        encoding: audio.tags.encoder
                    };
                }
                else {
                    result.info = {
                        codec: video.codec_name,
                        width: video.width,
                        height: video.height,
                        aspectRatio: video.display_aspect_ratio,
                        size: toMB(videoDetails.format.size) + ' MB',
                        duration: videoDetails.format.duration,
                        bitrate: video.bit_rate,
                        fps: video.r_frame_rate
                    };
                }

                resolve();
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

        await promise;
        return result;
    }

    async mergeMediaFiles(title, metadata) {
        const self = this;

        const presetsPath = path.resolve('presets');
        const ffmpegPath = path.resolve('../ffmpeg/bin/ffmpeg.exe');
        const ffmpegProbePath = path.resolve('../ffmpeg/bin/ffprobe.exe');

        ffmpeg.setFfmpegPath(ffmpegPath);
        ffmpeg.setFfprobePath(ffmpegProbePath);

        const videoPath = path.join(self.options.outputPath, 'v.mp4');
        const audioPath = path.join(self.options.outputPath, 'a.mp4');
        const outputPath = path.join(self.options.outputPath, sanitize(title + '.' + self.options.ext));

        var eta = 0;
        var speed = speedometer(5000);
        const toMB = i => (parseInt(i) / 1024).toFixed(2); // KB to MB

        const process = ffmpeg({
            presets: presetsPath
        });

        if(self.options.isMp3) {
            process.addInput(audioPath);
            process.preset('mp3');
        }
        else {
            process.addInput(videoPath);
            process.addInput(audioPath);
            process.preset(self.options.preset);
        }

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
            eta = Math.round(info.targetSize - info.currentKbps) / speed(info.currentKbps);
            percentage = info.percent;

            self.cliprogress.update(Math.round(self.totalPercentage + percentage), {
                speed: toMB(speed(info.currentKbps)),
                eta: eta
            });
        });

        process.saveToFile(outputPath);

        var promise = new Promise((resolve) => {
            process.on('error', (err, stdout, stderr) => {
                if(err) {
                    console.log('\n\n' + chalk.red.bold(err));
                    self.cliprogress.stop();
                    resolve();
                }
            });
            
            process.on('end', (stdout, stderr) => {
                self.totalPercentage += percentage;
                self.cliprogress.update(Math.round(self.totalPercentage), {
                    speed: 0,
                    eta: 0
                });
                self.cliprogress.stop();
                resolve();
            });
        });

        await promise;
    }
}

module.exports = YoutubeDownloader;