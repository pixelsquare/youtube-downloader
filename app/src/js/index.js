'use strict'

// const fs = require('fs');
// const path = require('path');

const fs = window.require('fs');
const path = window.require('path');

const async = require('async');
const ffmpeg = require('fluent-ffmpeg');
const speedometer = require('speedometer');
const sanitize = require('sanitize-filename');

const downloader = require('./../../lib/index.js');
window.$ = window.jQuery = require('jquery');

const isDevelopment = true;

const setCardInfo = (info) => {
    const titleElement = document.querySelector('#vid-title');
    const descriptionElement = document.querySelector('#vid-desc');
    const thumbnailElement = document.querySelector('#vid-thumbnail');
    const qualityDropdown = document.querySelector('#quality-dropdown');

    titleElement.innerHTML = info.title;
    descriptionElement.innerHTML = info.description;
    thumbnailElement.src = info.thumbnail;

    info.qualityList.forEach(e => {
        const li = document.createElement('li');
        li.classList.add('py-1');
    
        const a = document.createElement('a');
        a.classList.add('text-center');
        a.classList.add('p-0');
        a.innerHTML = e.quality;
        a.onclick = evnt => {

            download(info.videoInfo, e.itag, info.outputPath)
            .then(result => {
                console.log(result);
            })
            .catch(err => {
                setActionLoaderActive(false);
                setActionPanelActive(false);
                setActionResultActive(true);
            
                console.log(err);
                setActionResult(`Failed: ${err.message}`, () => {
                    setActionPanelActive(true);
                    setActionLoaderActive(false);
                    setActionResultActive(false);
                });
            });

            setProgressBarUpdate(0);

            setActionLoaderActive(true);
            setActionPanelActive(false);
            setActionResultActive(false);

            evnt.preventDefault();
        };

        li.appendChild(a);
        qualityDropdown.appendChild(li);
    });
}

var totalPercentage = 0;
var maxPercentage = 0;

const download = async (info, itag, outPath) => {
    var result = {};
    var metadata = {};

    const downloadData = {
        eta: 0,
        delta: 0,
        speed: speedometer(5000),
        totalDownloaded: 0
    }

    const time = 300; // Update time in milliseconds
    var nextUpdate = Date.now() + time;

    metadata.title = info.videoDetails.media.song || info.videoDetails.title;
    metadata.artist = info.videoDetails.media.artist;
    metadata.author = info.videoDetails.author.name;
    metadata.description = info.videoDetails.description;

    if(!fs.existsSync(outPath)) {
        fs.mkdirSync(outPath);
    }

    const tasks = [
        async function() {
            const stream = await downloader.download(info, { quality: 'highestaudio' });
            stream.pipe(fs.createWriteStream(path.join(outPath, sanitize('a.mp4'))));

            var percentage = 0;
            stream.on('progress', (chunkSize, downloaded, total) => {
                downloadData.totalDownloaded += parseInt(chunkSize);
                downloadData.delta += parseInt(chunkSize);

                percentage = (downloaded / total) * 100;
                setProgressBarUpdate(percentage / maxPercentage);
                // console.log(percentage + ' ' + maxPercentage + ' ' + (percentage / maxPercentage));

                if(Date.now() >= nextUpdate) {
                    downloadData.eta = Math.round(total - downloaded) / downloadData.speed(chunkSize);

                    downloadData.delta = 0;
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
                    resolve();
                });

            });

            await promise;
        },
        async function() {
            const stream = await downloader.download(info, { quality: itag ? itag : 'highestvideo' });
            stream.pipe(fs.createWriteStream(path.join(outPath, sanitize('v.mp4'))));

                var percentage = 0;
                stream.on('progress', (chunkSize, downloaded, total) => {
                    downloadData.totalDownloaded += parseInt(chunkSize);
                    downloadData.delta += parseInt(chunkSize);

                    percentage = (downloaded / total) * 100;
                    setProgressBarUpdate((totalPercentage + percentage) / maxPercentage);
                    // console.log((totalPercentage + percentage) + ' ' + maxPercentage + ' ' + ((totalPercentage + percentage) / maxPercentage));

                    if(Date.now() >= nextUpdate) {
                        downloadData.eta = Math.round(total - downloaded) / downloadData.speed(chunkSize);

                        downloadData.delta = 0;
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
                        resolve();
                    });
                });

                await promise;
        }
    ];

    maxPercentage = 100 + (tasks.length * 100);

    await async.series(tasks);

    var title = info.videoDetails.title;

    await mergeMediaFiles(title, outPath, metadata);

    result.filename = title;
    result.title = info.videoDetails.title;
    result.description = info.videoDetails.description;
    result.metadata = {
        author: info.videoDetails.author.name,
        likes: info.videoDetails.likes,
        viewCount: info.videoDetails.viewCount,
        subscriberCount: info.videoDetails.author.subscriber_count
    };

    setActionLoaderActive(false);
    setActionPanelActive(false);
    setActionResultActive(true);

    setActionResult('Download Complete!', () => {
        setActionPanelActive(true);
        setActionLoaderActive(false);
        setActionResultActive(false);
    });

    return result;
}

const mergeMediaFiles = async (title, outPath, metadata) => {
    const presetsPath = isDevelopment ? path.resolve('presets') : path.resolve('resources/app/presets');
    const ffmpegPath = isDevelopment ? path.resolve('../ffmpeg/bin/ffmpeg.exe') : path.resolve('resources/app/ffmpeg/bin/ffmpeg.exe');
    const ffmpegProbePath = isDevelopment ? path.resolve('../ffmpeg/bin/ffprobe.exe') : path.resolve('resources/app/ffmpeg/bin/ffprobe.exe');

    ffmpeg.setFfmpegPath(ffmpegPath);
    ffmpeg.setFfprobePath(ffmpegProbePath);

    const videoPath = path.join(outPath, 'v.mp4');
    const audioPath = path.join(outPath, 'a.mp4');
    const outputPath = path.join(outPath, sanitize(title + '.mp4'));

    var videoWidth, videoHeight, aspectRatio = 0;

    const videoPromise = new Promise((resolve) => {
        ffmpeg.ffprobe(videoPath, (err, data) => {
            if(err) {
                console.log(err);
                return;
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

    var eta = 0;
    var speed = speedometer(5000);
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
        eta = Math.round(info.targetSize - info.currentKbps) / speed(info.currentKbps);
        percentage = info.percent;
        setProgressBarUpdate((totalPercentage + percentage) / maxPercentage);
        // console.log((totalPercentage + percentage) + ' ' + maxPercentage + ' ' + ((totalPercentage + percentage) / maxPercentage));
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
            resolve();
        });
    });

    await promise;
};

const setProgressBarUpdate = (percent) => {
    const progress = document.querySelector('.percentage');
    const progressBar = document.querySelector('.determinate');

    const percentage = percent * 100;
    progress.innerHTML = percentage.toFixed(0) + '%';
    progressBar.style.width = percentage + '%';
};

const setActionPanelActive = (active) => {
    if(active) {
        $('#action-panel').show();
    }
    else {
        $('#action-panel').hide();
    }
};

const setActionLoaderActive = (active) => {
    if(active) {
        $('#action-loader').show();
    }
    else {
        $('#action-loader').hide();
    }  
};

const setActionResultActive = (active) => {
    if(active) {
        $('#action-result').show();
    }
    else {
        $('#action-result').hide();
    }  
};

const setActionResult = (msg, callback) => {
    const resultText = document.querySelector('#action-result > div');
    const resultButton = document.querySelector('#action-result > a');

    resultText.innerHTML = msg;
    resultButton.onclick = e => {
        callback();
        e.preventDefault();
    };
};

const setCardMainActive = (active) => {
    if(active) {
        $('#card-main').show();
    }
    else {
        $('#card-main').hide();
    } 
};

const setCardLoaderActive = (active) => {
    if(active) {
        $('#card-loader').show();
    }
    else {
        $('#card-loader').hide();
    } 
};

const setCardResultActive = (active) => {
    if(active) {
        $('#card-result').show();
    }
    else {
        $('#card-result').hide();
    } 
};

const setCardResult = (msg) => {
    const resultText = document.querySelector('#card-result > .card-stacked > span');

    if(resultText) {
        resultText.innerHTML = msg;
    }
};

window.addEventListener('DOMContentLoaded', e => {
    console.log('DOM loaded');
    M.AutoInit();
    
    // var elems = document.querySelectorAll('.materialboxed');
    // var instances = M.Materialbox.init(elems, options);

    const elements = document.querySelectorAll('.dropdown-trigger');
    M.Dropdown.init(elements, { 
        container: document.querySelector('main'),
        hover: true, 
        coverTrigger: false, 
        alignment: 'right'
     });

     setCardMainActive(false);
     setCardLoaderActive(false);
     setCardResultActive(false);
     
     setActionPanelActive(true);
     setActionLoaderActive(false);
     setActionResultActive(false);

     const urlInput = document.querySelector('#yt-url');
     urlInput.addEventListener('input', e => {    
        const url = e.target.value;
        setTimeout(() => {    
            if(url) {
                setCardLoaderActive(true);
                setCardMainActive(false);
                setCardResultActive(false);
                
                downloader.getURLInfo(url)
                .then(result => {
                    if(result) {
                        setCardInfo({
                            title: result.videoDetails.title,
                            description: result.videoDetails.description,
                            thumbnail: result.videoDetails.thumbnails[result.videoDetails.thumbnails.length - 1].url,
                            qualityList: downloader.getAvailableQuality(result),
                            outputPath: path.resolve('output'),
                            videoInfo: result
                        });
                        
                        setCardMainActive(true);
                        setCardLoaderActive(false);
                        setCardResultActive(false);
                    }
                }).catch(err => {
                    if(err) {
                        setCardResult(err.message);
                        setCardResultActive(true);
                        setCardLoaderActive(false);
                        setCardMainActive(false);
                    }
                });
            }
            else {
                setCardMainActive(false);
                setCardLoaderActive(false);
                setCardResultActive(false);
                
                setActionPanelActive(true);
                setActionLoaderActive(false);
                setActionResultActive(false);
            }
        }, 500);
     });

    //  $('#yt-url').on('input', event => {
    //      console.log($(this.val()));

    //  });

    // downloader.getURLInfo('https://www.youtube.com/watch?v=LXb3EKWsInQ').then(result => {
    // downloader.getURLInfo('https://www.youtube.com/watch?v=ig3Qa6IINYo').then(result => {
    //     setCardInfo({
    //         title: result.videoDetails.title,
    //         description: result.videoDetails.description,
    //         thumbnail: result.videoDetails.thumbnails[result.videoDetails.thumbnails.length - 1].url,
    //         qualityList: downloader.getAvailableQuality(result),
    //         outputPath: path.resolve('output'),
    //         videoInfo: result
    //     })
    //  });

}, false);

window.addEventListener('resize', () => {
    console.log(window.innerWidth + 'x' + window.innerHeight);
});