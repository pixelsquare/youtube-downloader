'use strict'

const fs = require('fs');
const path = require('path');
const events = require('events');
const ytdl = require('ytdl-core');
const progress = require('progress-stream');
const sanitize = require('sanitize-filename');
const CLIProgress = require('cli-progress');

class YoutubeDownloader extends events.EventEmitter {

    static deployed() {
        const promise = new Promise((resolve, reject) => {
            resolve(new YoutubeDownloader());
        });

        return promise;
    }

    constructor() { 
        super();
        this.url = "";
        this.name = "";
        this.outputPath = "";
        this.isMp3 = false;
    }

    init(args) {

        if(!args) {
            return false;
        }

        var init = false;
        var argsArray = args.split(' ');

        this.isMp3 = argsArray.includes('-mp3');
        
        if(argsArray.includes('-name') && argsArray.length > 1) {
            this.name = argsArray[argsArray.indexOf('-name') + 1];
        }

        if(argsArray.includes('-url') && argsArray.length > 1) {
            this.url = argsArray[argsArray.indexOf('-url') + 1];

            if(this.url.includes('https://www.youtube.com')) {
                init = true;
            }
            else {
                init = false;
                this.emit('error', { function: 'init', message: 'Invalid URL Format!', payload: this.url });
            }
        }

        if(argsArray.includes('-o') && argsArray.length > 1) {
            this.outputPath = argsArray[argsArray.indexOf('-o') + 1];
        }
        else if(argsArray.includes('-out') && argsArray.length > 1) {
            this.outputPath = argsArray[argsArray.indexOf('-out') + 1];
        }
        else if(argsArray.includes('-output') && argsArray.length > 1) {
            this.outputPath = argsArray[argsArray.indexOf('-output') + 1];
        }
        else {
            init = false;
            this.emit('error', { function: 'init', message: 'Output path is required!', payload: this.url });
        }

        return init;
    }

    getURLInfo(url) {
        const self = this;
        if(url && ytdl.validateURL(url)) {
            return self.getURLInfoAsync(url);
        }
        
        self.emit('error', { function: 'getURLInfo', message: 'Failed to validate URL', payload: url });
        return null;
    }

    getURLBasicInfo(url) {
        const self = this;
        if(url && ytdl.validateURL(url)) {
            return self.getURLBasicInfoAsync(url);
        }

        self.emit('error', { function: 'getURLBasicInfo', message: 'Failed to validate URL', payload: url });
        return null;
    }

    download(url, callback) {
        const self = this;
        if(url && ytdl.validateURL(url)) {
            self.downloadAsync(url).then(function(result) {
                callback(result);
            });
        }
        else {  
            self.emit('error', { function: 'download', message: 'Failed to validate URL', payload: url });
            callback(null);
        }
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

    async downloadAsync(url) {
        const self = this;
        var info = null;

        try {
            info = await ytdl.getInfo(url);
        }
        catch(err) {
            self.emit('error', { function: 'downloadAsync', message: 'Failed to get info from URL', payload: err });
        }

        var result = {
            url: url
        };

        const cliProgress = new CLIProgress.SingleBar({ 
            format: '{bar} {percentage}% | {filename} | ETA: {eta}s | {speed} kbit',
            clearOnComplete: false,
            hideCursor: true
        }, CLIProgress.Presets.shades_classic);

        const options = {
            quality: 'highest',
            filter: format => format.container === 'mp4'
        };

        const stream = await ytdl.downloadFromInfo(info, options);

        stream.on('error', function(err) {
            self.emit('error', { function: 'downloadAsync', message: 'Stream failed to download', payload: err });
        });

        const title = info.videoDetails.title;
        const outputPath = self.outputPath;

        stream.on('response', function(httpResponse) {
            cliProgress.start(100, 0, { filename: info.videoDetails.title, speed: 'N/A' });

            const streamProgress = progress({
                length: parseInt(httpResponse.headers['content-length']),
                time: 100
            });

            streamProgress.on('error', function(err) {
                self.emit('error', { function: 'downloadAsync.streamProgress', message: 'Stream progress failed', payload: err });
            })

            streamProgress.on('progress', function(progress) {
                cliProgress.update(parseInt(progress.percentage), {
                    speed: parseInt(progress.speed),
                    eta: progress.eta
                });

                if(progress.percentage === 100) {
                    result.author = info.videoDetails.author.name;
                    result.title = info.videoDetails.title;
                    result.description = info.videoDetails.description;
                    result.lengthSeconds = info.videoDetails.lengthSeconds;
                    result.likes = info.videoDetails.likes;
                    result.viewCount = info.videoDetails.viewCount
                    result.subscriberCount = info.videoDetails.author.subscriber_count;
                    result.stats = {
                        size: progress.length,
                        transferredBytes: progress.transferred,
                        runtime: progress.runtime,
                        averageSpeed: parseFloat(progress.speed.toFixed(2))
                    };

                    cliProgress.stop();
                    self.emit('finish', { result : result });
                }

                self.emit('progress', { progress: progress });
            });

            const filepath = path.join(outputPath, sanitize(title + '.mp4'));
            stream.pipe(streamProgress).pipe(fs.createWriteStream(filepath));
        });

        var promise = new Promise((resolve, reject) => {
            stream.on('end', function() {
                cliProgress.stop();
                resolve();
            });
        });

        await promise;
        return result;
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