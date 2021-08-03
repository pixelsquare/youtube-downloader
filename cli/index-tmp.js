const path = require('path');
const ytdl = require('ytdl-core');
const CLIProgress = require('cli-progress');
const YTDownloader = require('youtube-mp3-downloader');

var arguments = process.argv.slice(2);

var url = arguments.indexOf('-url') > -1 ? arguments[arguments.indexOf('-url') + 1] : "";
var videoName = arguments.indexOf('-name') > -1 ? arguments[arguments.indexOf('-name') + 1] : "";
var isMp3 = arguments.indexOf('-mp3') > -1;

var videoIdIndex = url.indexOf('watch?v=') + 8;
var videoId = url.indexOf('watch?v=') > -1 ? url.slice(videoIdIndex, videoIdIndex + 11) : "";

url = url.slice(0, videoIdIndex + 11); // Trim excess arguments

if (videoId) {
    const progress = new CLIProgress.SingleBar({ format: '{bar} {percentage}% | {filename} | ETA: {eta}s | {speed} kbit', clearOnComplete: false, hideCursor: true }, CLIProgress.Presets.shades_classic);

    if(isMp3) {
        const config = {
            'ffmpegPath': path.join(__dirname, '/../ffmpeg/bin/ffmpeg.exe'), // ffmpeg binary REQUIRED to convert video file to mp3. 
            'outputPath': path.resolve(__dirname, 'output'),
            'youtubeVideoQuality': 'highest',
            'queueParallelism': 2,
            'progressTimeout': 2000,
            'allowWebm': false
        };

        const downloader = new YTDownloader(config);

        async function startDownload() {
            const info;
            try {
                info = await ytdl.getInfo(url);
                downloader.download(videoId, videoName);
                progress.start(100, 0, { filename: info.videoDetails.title, speed: 'N/A' });
            }
            catch(err) {
                console.log(err);
            }
        }

        downloader.on('finished', function (err, data) {
            progress.stop();
            console.log(data);
        });

        downloader.on('error', function (error) {
            progress.stop();
            console.log(error);
            throw error;
        });

        downloader.on('progress', function (data) {
            progress.update(parseInt(data.progress.percentage), {
                speed: parseInt(data.progress.speed),
                eta: data.progress.eta,
            });
        });

        startDownload();
    }
    else {
        async function startDownload() {
            const info;
            try {
                info = await ytdl.getInfo(url);
                progress.start(100, 0, { filename: info.videoDetails.title, speed: 'N/A' });
            }
            catch(err) {
                console.log(err);
            }
        }

        startDownload();
    }
}
else {
    console.log('ERR: Failed no URL specified!');
}
