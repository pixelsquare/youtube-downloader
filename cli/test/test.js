'use strict'

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const YTDownloader = require('../YoutubeDownloader.js');
const { exec } = require('child_process');

const url = 'https://www.youtube.com/watch?v=ig3Qa6IINYo';

describe('Initializes with arguments', function() {

    it('Empty argument should fail', function() {
        const downloader = new YTDownloader({});
        return downloader.getURLInfo().then(assert.fail).catch(err => {
            assert(err.function.indexOf('getURLInfo') >= 0, 'Error message should contain the function name');
            assert(err.message.indexOf('validate') >= 0, 'Error message should contain the function name');
        });
    });

    it('Should fail on invalid url', function() {
        const downloader = new YTDownloader({
            url: 'https://www.google.com'
        });

        assert(downloader.getURL().indexOf('google') >= 0, 'URL should have the same id');

        return downloader.getURLInfo().then(assert.fail).catch(err => {
            assert(err.function.indexOf('getURLInfo') >= 0, 'Error message should contain the function name');
            assert(err.message.indexOf('validate') >= 0, 'Error message should contain the function name');
        });
    });

    it('--url', function() {
        const downloader = new YTDownloader({
            url: url
        });
        
        assert(downloader.getURL().indexOf('ig3Qa6IINYo') >= 0, 'URL should have the same id');
        
        return downloader.getURLInfo().then(result => {
            assert(result, 'Result should not be empy or nulled');
            assert(result.title, 'Result should contain title');
            assert(result.description, 'Result should contain description');
        });
    });

    it('Should fail on invalid ouput path', function() {
        const downloader = new YTDownloader({
            url: url,
            output: path.resolve('none_existing_dir')
        });

        assert(downloader.getOutputPath().indexOf('out') >= 0, 'Output path should have the same directory');
        
        return downloader.download().then(assert.fail).catch(err => {
            assert(err.function.indexOf('download') >= 0, 'Error message should contain the function name');
            assert(err.message.indexOf('Invalid') >= 0, 'Error message should contain invalid');
        });
    });

    // it('-o, --output', function() {
    //     const downloader = new YTDownloader({
    //         url: url,
    //         output: path.resolve('out')
    //     });

    //     if(!fs.existsSync(path.resolve('out'))) {
    //         fs.mkdirSync(path.resolve('out'));
    //     }

    //     assert(downloader.getOutputPath().indexOf('out') >= 0, 'Output path should have the same directory');
        
    //     this.timeout(90000);
    //     return downloader.download().then(result => {
    //         assert(result, 'Resuld should not be nulled');

    //         const outFile = fs.existsSync(path.resolve('out/out.mp4'));
    //         const aFile = fs.existsSync(path.resolve('out/a.mp4'));
    //         const vFile = fs.existsSync(path.resolve('out/v.mp4'));

    //         assert(outFile, 'Out file should exist');
    //         assert(aFile, 'Audio file should exist');
    //         assert(vFile, 'Video file should exist');

    //         if(aFile && vFile && outFile) {
    //             fs.rmdirSync(path.resolve('out'), { recursive: true });
    //         }
    //     });
    // });

    // it('--title', function() {
    //     const title = 'Sample Video Title';
    //     const downloader = new YTDownloader({
    //         url: url,
    //         output: path.resolve('out'),
    //         title: title
    //     });

    //     if(!fs.existsSync(path.resolve('out'))) {
    //         fs.mkdirSync(path.resolve('out'));
    //     }

    //     assert(downloader.getOutputPath().indexOf('out') >= 0, 'Output path should have the same directory');
    //     assert(downloader.getTitle().indexOf(title) >= 0, 'Title should be the same');
        
    //     this.timeout(90000);
    //     return downloader.download().then(result => {
    //         assert(result, 'Resuld should not be nulled');
            
    //         const outFile = fs.existsSync(path.resolve(`out/${title}.mp4`));
    //         const aFile = fs.existsSync(path.resolve('out/a.mp4'));
    //         const vFile = fs.existsSync(path.resolve('out/v.mp4'));

    //         assert(outFile, 'Out file should exist');
    //         assert(aFile, 'Audio file should exist');
    //         assert(vFile, 'Video file should exist');

    //         if(aFile && vFile && outFile) {
    //             fs.rmdirSync(path.resolve('out'), { recursive: true });
    //         }
    //     });
    // });

    // it('--preset', function() {
    //     const preset = 'low-res';
    //     const downloader = new YTDownloader({
    //         url: url,
    //         output: path.resolve('out'),
    //         preset: preset
    //     });

    //     if(!fs.existsSync(path.resolve('out'))) {
    //         fs.mkdirSync(path.resolve('out'));
    //     }

    //     assert(downloader.getOutputPath().indexOf('out') >= 0, 'Output path should have the same directory');
    //     assert(downloader.getPreset().indexOf(preset) >= 0, 'Preset should be the same');
        
    //     this.timeout(90000);
    //     return downloader.download().then(result => {
    //         assert(result, 'Resuld should not be nulled');
            
    //         const outFile = fs.existsSync(path.resolve('out/out.mp4'));
    //         const aFile = fs.existsSync(path.resolve('out/a.mp4'));
    //         const vFile = fs.existsSync(path.resolve('out/v.mp4'));

    //         assert(outFile, 'Out file should exist');
    //         assert(aFile, 'Audio file should exist');
    //         assert(vFile, 'Video file should exist');

    //         const ffprobePath = path.resolve('../ffmpeg/bin/ffprobe.exe');
    //         const outputPath = path.resolve('out/out.mp4');
    //         const command = `${ffprobePath} -v quiet -print_format json -show_format -show_streams ${outputPath}`;
            
    //         exec(command, (err, stdout, stderr) => {
    //             if(err) {
    //                 console.log(`Error: ${err}`);
    //             }

    //             const videoDetails = JSON.parse(stdout);

    //             const audio = videoDetails.streams.filter(filter => filter.codec_type === 'audio')[0];
    //             const video = videoDetails.streams.filter(filter => filter.codec_type === 'video')[0];

    //             assert(video.codec_name, 'vp9', 'Codec must be vp9 for low resolution');

    //             if(aFile && vFile && outFile) {
    //                 fs.rmdirSync(path.resolve('out'), { recursive: true });
    //             }
    //         }); 
    //     });
    // });

    it('--mp3', function() {
        const downloader = new YTDownloader({
            url: url,
            output: path.resolve('out'),
            isMp3: true
        });

        if(!fs.existsSync(path.resolve('out'))) {
            fs.mkdirSync(path.resolve('out'));
        }

        assert(downloader.getOutputPath().indexOf('out') >= 0, 'Output path should have the same directory');
        assert(downloader.isMP3(), 'Flag should be true');
        
        this.timeout(90000);
        return downloader.download().then(result => {
            assert(result, 'Resuld should not be nulled');
            
            const outFile = fs.existsSync(path.resolve('out/out.mp3'));
            const aFile = fs.existsSync(path.resolve('out/a.mp4'));
            const vFile = fs.existsSync(path.resolve('out/v.mp4'));

            assert(outFile, 'Out file should exist');
            assert(aFile, 'Audio file should exist');
            // assert(vFile, 'Video file should exist');

            const ffprobePath = path.resolve('../ffmpeg/bin/ffprobe.exe');
            const outputPath = path.resolve('out/out.mp3');
            const command = `${ffprobePath} -v quiet -print_format json -show_format -show_streams ${outputPath}`;
            
            exec(command, (err, stdout, stderr) => {
                if(err) {
                    console.log(`Error: ${err}`);
                }

                const videoDetails = JSON.parse(stdout);

                const audio = videoDetails.streams.filter(filter => filter.codec_type === 'audio')[0];
                const video = videoDetails.streams.filter(filter => filter.codec_type === 'video')[0];

                assert(audio.codec_name, 'mp3', 'Codec must be mp3 encoding');

                if(aFile && outFile) {
                    fs.rmdirSync(path.resolve('out'), { recursive: true });
                }
            }); 
        });
    });
});


describe('Getting URL information', function() {
    var downloader;
    this.beforeEach(() => {
        downloader = new YTDownloader({
            url: url
        });
    });

    it('Should be able to get information from url', function() {
        return downloader.getURLInfo().then(info => {
            assert(info, 'Result should not be nulled');
            assert(info.title, 'Should contain video title');
            assert(info.description, 'Should contain video description');
        });
    });

    it('Should be able to get basic information from url', function() {
        return downloader.getURLBasicInfo().then(info => {
            assert(info, 'Result should not be nulled');
            assert(info.title, 'Should contain video title');
            assert(info.description, 'Should contain video description');
        });
    });

    it('Should be able to get video format from url', function() {
        return downloader.getVideoFormat().then(info => {
            assert(info, 'Result should not be nulled');
        });
    });
});

// describe('Downloading a video', function() {
//     var downloader;
//     this.beforeEach(() => {
//         downloader = new YTDownloader({
//             url: url
//         });
//     });

//     this.timeout(90000)

//     it('Should be able to download a video', function() {
//         return downloader.download().then(result => {
//             assert(result, 'Result should not be nulled');
//         });
//         // return downloader.deployed().then(function(instance) {
//         //     downloaderInstance = instance;
//         //     const promise = new Promise((resolve, reject) => {
//         //         downloaderInstance.download('https://www.youtube.com/watch?v=Y2rDb4Ur2dw', function(result) {
//         //             resolve(result);
//         //         });
//         //     });
//         //     return promise;
//         // }).then(function(result) {
//         //     assert(result, 'Result should not be nulled');
//         //     assert(result.title, 'Should contain video title');
//         //     assert(result.description, 'Should contain video description');
//         // });
//     });
// });

