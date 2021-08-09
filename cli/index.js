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
const CLIProgress = require('cli-progress');

// Add Quality argument (-q)
// - Accepts quality like 720p, 1080p, 1440p, 2k, 4k resolution
// - Accepts High, Low, Default

// Add Itag argument (-itag)
// - Accepts an number corresponding to youtube itag

// Add Force flag argument (-f)
// - Forcing the quality of the video to bump up or down

class YoutubeDownloader extends events.EventEmitter {

    constructor() { 
        super();
        this.url = '';
        this.name = '';
        this.outputPath = path.resolve('output');
        this.isMp3 = false;
        this.totalPercentage = 0;
        this.cliprogress = new CLIProgress.SingleBar({ 
            format: '{bar} {percentage}% | {filename} | ETA: {eta}s | {speed} Mb/s', 
            clearOnComplete: false, 
            hideCursor: true 
        }, 
        CLIProgress.Presets.shades_classic);
    }

    init(args) {
        if(!args) {
            return Promise.reject({ message: 'Invalid or empty arguments!'});
        }

        var argsArray = args.split(' ');

        this.isMp3 = argsArray.includes('-mp3');
        
        if(argsArray.includes('-name') && (argsArray.indexOf('-name') + 1) < argsArray.length) {
            this.name = argsArray[argsArray.indexOf('-name') + 1];
        }

        if(argsArray.includes('-url') && (argsArray.indexOf('-url') + 1) < argsArray.length) {
            this.url = argsArray[argsArray.indexOf('-url') + 1];

            if(!this.url.includes('https://www.youtube.com')) {
                return Promise.reject({ function: 'init', message: 'Invalid URL Format!', payload: args });
            }
        }
        else {
            return Promise.reject({ function: 'init', message: 'URL is required', payload: args });
        }

        if(argsArray.includes('-o')) {
            this.outputPath = ((argsArray.indexOf('-o') + 1) >= argsArray.length) ? path.resolve('output') : argsArray[argsArray.indexOf('-o') + 1];
        }
        else if(argsArray.includes('-out')) {
            this.outputPath = ((argsArray.indexOf('-out') + 1) >= argsArray.length) ? path.resolve('output') : argsArray[argsArray.indexOf('-out') + 1];
        }
        else if(argsArray.includes('-output')) {
            this.outputPath = ((argsArray.indexOf('-output') + 1) >= argsArray.length) ? path.resolve('output') : argsArray[argsArray.indexOf('-output') + 1];
        }

        return Promise.resolve(this);
    }

    getURLInfo() {
        const self = this;
        if(self.url && ytdl.validateURL(self.url)) {
            return self.getURLInfoAsync(self.url);
        }
        
        self.emit('error', { function: 'getURLInfo', message: 'Failed to validate URL', payload: url });
        return Promise.reject({ message: 'Failed to validate URL' });
    }

    getURLBasicInfo() {
        const self = this;
        if(self.url && ytdl.validateURL(self.url)) {
            return self.getURLBasicInfoAsync(self.url);
        }

        self.emit('error', { function: 'getURLBasicInfo', message: 'Failed to validate URL', payload: url });
        return Promise.reject({ message: 'Failed to validate URL' });
    }

    getVideoFormat() {
        const self = this;
        if(self.url && ytdl.validateURL(self.url)) {
            return self.getVideoFormatAsync(self.url);
        }

        self.emit('error', { function: 'getVideoFormat', message: 'Failed to validate URL', payload: url });
        return Promise.reject({ message: 'Failed to validate URL' });
    }

    download() {
        const self = this;
        if(self.url && ytdl.validateURL(self.url)) {
            return self.downloadAsync(self.url);
            // self.downloadAsync(url).then(function(result) {
            //     callback(result);
            // });
        }
        // else {  
        //     self.emit('error', { function: 'download', message: 'Failed to validate URL', payload: url });
        //     // callback(null);
        // }
        
        self.emit('error', { function: 'download', message: 'Failed to validate URL', payload: url });
        return Promise.reject({ message: 'Failed to validate URL' });
    }

    async getURLInfoAsync(url) {
        const self = this;
        var info = null;

        try {
            info = await ytdl.getInfo(url);
            return info = info.videoDetails;
        }
        catch(err) {
            self.emit('error', { function: 'getURLInfoAsync', message: 'Unable to get info from URL!', payload: url });
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
            self.emit('error', { function: 'getURLBasicInfoAsync', message: 'Unable to get info from URL!', payload: url });
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
            self.emit('error', { function: 'getVideoFormats', message: 'Failed to get info from URL', payload: err.message });
        }

        // var result = [];

        // info.formats.filter(format => format.container === 'mp4').forEach(a => {
        //     result.push({
        //         itag: a.itag,
        //         qualityLabel: a.qualityLabel,
        //         quality: a.quality,
        //         fps: a.fps,
        //         width: a.width,
        //         height: a.height,
        //         url: a.url
        //     });
        // });

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
            self.emit('error', { function: 'downloadAsync', message: 'Failed to get info from URL', payload: err.message });
        }

        var eta = 0;
        var delta = 0;
        var speed = speedometer(5000);
        const toMB = i => (parseInt(i) / 1024 / 1024).toFixed(2); // Byte to KB to MB

        var totalDownloaded = 0;
        const totalLength = 300;

        const time = 300;
        var nextUpdate = Date.now() + time;

        self.cliprogress.start(totalLength, self.totalPercentage, { filename: truncate(info.videoDetails.title, 20, { position: 21}), speed: "N/A" });

        await async.series([
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
        ]);

        // self.cliprogress.stop();
        await self.mergeMediaFiles(info.videoDetails.title);
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
        const outPath = path.join(self.outputPath, 'out.mp4');

        var eta = 0;
        var speed = speedometer(5000);
        const toMB = i => (parseInt(i) / 1024).toFixed(2); // KB to MB

        const process = ffmpeg({
            presets: presetsPath
        });

        process.addInput(videoPath);
        process.addInput(audioPath);
        process.preset('4k-res');

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

        process.saveToFile(outPath);

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

    getName() {
        return this.name;
    }

    getOutputPath() {
        return this.outputPath;
    }

    isMP3() {
        return this.isMp3;
    }

};

module.exports = YoutubeDownloader;