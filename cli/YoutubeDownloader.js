'use strict'

const fs = require('fs');
const path = require('path');
const events = require('events');

const async = require('async');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const speedometer = require('speedometer');
const sanitize = require('sanitize-filename');
const truncate = require('smart-truncate');

const { exec } = require('child_process');
const { SingleBar, Presets } = require('cli-progress');

// Add Quality argument (-q)
// - Accepts quality like 720p, 1080p, 1440p, 2k, 4k resolution
// - Accepts High, Low, Default

// Add Itag argument (-itag)
// - Accepts an number corresponding to youtube itag

// Add Force flag argument (-f)
// - Forcing the quality of the video to bump up or down

// TODO: Add metadata options

class YoutubeDownloader extends events.EventEmitter {

    constructor(options) { 
        super();

        this.url = options.url;
        this.title = options.title || 'out';
        this.outputPath = options.output || path.resolve('output');
        this.quality = options.quality || '320p'; // TODO
        this.ext = options.ext || 'mp4'; // TODO
        this.preset = options.preset || 'mid-res';
        this.itag = options.itag || -1; // TODO
        this.isMp3 = options.isMp3 || false;
        this.force = options.force || false; // TODO

        this.totalPercentage = 0;
        this.cliprogress = new SingleBar({ 
            format: '{bar} {percentage}% | {filename} | ETA: {eta}s | {speed} Mb/s', 
            clearOnComplete: false, 
            hideCursor: true 
        }, 
        Presets.shades_classic);
    }

    getURLInfo() {
        const self = this;
        if(self.url && ytdl.validateURL(self.url)) {
            return self.getURLInfoAsync(self.url);
        }
        
        const error = { 
            function: 'getURLInfo', 
            message: 'Failed to validate URL', 
            payload: self.url 
        };

        // self.emit('error', error);
        return Promise.reject(error);
    }

    getURLBasicInfo() {
        const self = this;
        if(self.url && ytdl.validateURL(self.url)) {
            return self.getURLBasicInfoAsync(self.url);
        }

        const error = { 
            function: 'getURLBasicInfo', 
            message: 'Failed to validate URL', 
            payload: self.url 
        };

        // self.emit('error', error);
        return Promise.reject(error);
    }

    getVideoFormat() {
        const self = this;
        if(self.url && ytdl.validateURL(self.url)) {
            return self.getVideoFormatAsync(self.url);
        }

        const error = { 
            function: 'getVideoFormat', 
            message: 'Failed to validate URL', 
            payload: self.url 
        };

        // self.emit('error', error);
        return Promise.reject(error);
    }

    download() {
        const self = this;

        if(!fs.existsSync(self.outputPath)) {
            const error = { 
                function: 'download', 
                message: 'Invalid output path', 
                payload: self.url 
            };
            
            // self.emit('error', error);
            return Promise.reject(error);
        }

        if(self.url && ytdl.validateURL(self.url)) {
            return self.downloadAsync(self.url);
        }
 
        const error = { 
            function: 'download', 
            message: 'Failed to validate URL', 
            payload: self.url 
        };
        
        // self.emit('error', error);
        return Promise.reject(error);
    }

    async getURLInfoAsync(url) {
        const self = this;
        var info = null;

        try {
            info = await ytdl.getInfo(url);
            return info = info.videoDetails;
        }
        catch(err) {
            const error = { 
                function: 'getURLInfoAsync', 
                message: 'Unable to get info from URL', 
                payload: err.message
            };

            self.emit('error', error);
        }

        return info;
    }

    async getURLBasicInfoAsync(url) {
        const self = this;
        var info = null;

        try {
            info = await ytdl.getBasicInfo(url);
            return info = info.videoDetails;
        }
        catch(err) {            
            const error = { 
                function: 'getURLBasicInfoAsync', 
                message: 'Unable to get info from URL', 
                payload: err.message
            };

            self.emit('error', error);
        }

        return info;
    }

    async getVideoFormatAsync(url) {
        const self = this;
        var info = null;

        try {
            info = await ytdl.getInfo(url);
        }
        catch(err) {
            const error = { 
                function: 'getVideoFormats', 
                message: 'Failed to get info from URL', 
                payload: err.message
            };

            self.emit('error', error);
        }

        return info.formats;
    }

    async downloadAsync(url) {
        const self =  this;

        var result = { url: url };
        var info = null;

        try {
            info = await ytdl.getInfo(url);
        }
        catch(err) {
            const error = { 
                function: 'downloadAsync', 
                message: 'Failed to get info from URL', 
                payload: err.message
            };

            self.emit('error', error);
        }

        const tasks = [
            async function() {
                const stream = ytdl.downloadFromInfo(info, { quality: 'highestaudio' });
                stream.pipe(fs.createWriteStream(path.join(self.outputPath, sanitize('a.mp4'))));

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
               const stream = ytdl.downloadFromInfo(info, { quality: 'highestvideo' });
               stream.pipe(fs.createWriteStream(path.join(self.outputPath, sanitize('v.mp4'))));

                var percentage = 0;
                stream.on('progress', (chunkSize, downloaded, total) => {
                    totalDownloaded += parseInt(chunkSize);
                    delta += parseInt(chunkSize);

                    percentage = (totalDownloaded / total) * 100;

                    if(Date.now() >= nextUpdate) {
                        eta = Math.round(total - downloaded) / speed(chunkSize);
                        self.cliprogress.update(self.totalPercentage + parseInt(percentage), {
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

        if(self.isMp3) {
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

        var title = self.title || info.videoDetails.title;
        const outputPath = path.join(self.outputPath, sanitize(title) + (self.isMp3 ? '.mp3' : '.mp4'));

        await self.mergeMediaFiles(title);

        const ffprobePath = path.resolve('../ffmpeg/bin/ffprobe.exe');
        const command = `${ffprobePath} -v quiet -print_format json -show_format -show_streams ${outputPath}`;
        
        const promise = new Promise((resolve) => {
            exec(command, (err, stdout, stderr) => {
                if(err) {
                    console.log(`Error: ${err}`);
                }
    
                const videoDetails = JSON.parse(stdout);
    
                const audio = videoDetails.streams.filter(filter => filter.codec_type === 'audio')[0];
                const video = videoDetails.streams.filter(filter => filter.codec_type === 'video')[0];
    
                result.outputPath = videoDetails.format.filename;

                if(self.isMp3) {
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
                        bitrate: video.bit_rate
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

    async mergeMediaFiles(title) {
        const self = this;

        const presetsPath = path.resolve('presets');
        const ffmpegPath = path.resolve('../ffmpeg/bin/ffmpeg.exe');
        const ffmpegProbePath = path.resolve('../ffmpeg/bin/ffprobe.exe');

        ffmpeg.setFfmpegPath(ffmpegPath);
        ffmpeg.setFfprobePath(ffmpegProbePath);

        const videoPath = path.join(self.outputPath, 'v.mp4');
        const audioPath = path.join(self.outputPath, 'a.mp4');
        const outputPath = path.join(self.outputPath, sanitize(title) + (self.isMp3 ? '.mp3' : '.mp4'));

        var eta = 0;
        var speed = speedometer(5000);
        const toMB = i => (parseInt(i) / 1024).toFixed(2); // KB to MB

        // TODO
        // const outputOptions = [
        //     '-metadata', 'title=' + title,
        //     '-metadata', 'artist=' + artist
        // ];

        const process = ffmpeg({
            presets: presetsPath
        });

        if(self.isMp3) {
            process.addInput(audioPath);
            process.preset('mp3');
        }
        else {
            process.addInput(videoPath);
            process.addInput(audioPath);
            process.preset(self.preset);
        }

        // TODO
        // process.outputOptions(...outputOptions);

        // process.on('start', command => {
        //     // console.log(command);
        //     cliprogress.start(100, 0, { filename: title, speed: "N/A" });
        // });

        // process.on('codecData', data => {
        //     console.log(data);
        // });

        // process.on('stderr', info => {
        //     console.log(info);
        // });

        process.on('error', (err, stdout, stderr) => {
            if(err) {
                console.log(err);
            }
        });

        var percentage = 0;
        process.on('progress', info => {
            eta = Math.round(info.targetSize - info.currentKbps) / speed(info.currentKbps);
            percentage = info.percent;

            self.cliprogress.update(self.totalPercentage + percentage, {
                speed: toMB(speed(info.currentKbps)),
                eta: eta
            });
        });

        process.saveToFile(outputPath);

        var promise = new Promise((resolve) => {
            process.on('end', (stdout, stderr) => {
                self.totalPercentage += percentage;
                self.cliprogress.update(self.totalPercentage, {
                    speed: 0,
                    eta: 0
                });
                self.cliprogress.stop();
                resolve();
            });
        });

        await promise;
    }

    getURL() {
        return this.url;
    }

    getTitle() {
        return this.title;
    }

    getOutputPath() {
        return this.outputPath;
    }

    getQuality() {
        return this.quality;
    }

    getPreset() {
        return this.preset;
    }

    getItag() {
        return this.itag;
    }

    isMP3() {
        return this.isMp3;
    }

    forced() {
        return this.force;
    }

};

module.exports = YoutubeDownloader;