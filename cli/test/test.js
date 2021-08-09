'use strict'

const async = require('async');
const assert = require('assert');
const YTDownloader = require('../index.js');

describe('Initializes with arguments', function() {
    var downloader;
    this.beforeEach(() => {
        downloader = new YTDownloader();
    });

    it('Empty argument should fail', function() {
        return downloader.init().then(instance => {
            assert(!instance, 'Instance should be null');
            return instance;
        }).then(assert.fail).catch(err => {
            assert(err.message.indexOf('Invalid') >= 0, 'Error message must contain invalid');
        });
    });

    it('Should require -url argument with valid url', function() {
        return downloader.init('-url https://www.youtube.com').then(instance => {
            assert(instance, 'Instance should not be null');
            return instance.getURL();
        }).then(url => {
            assert.equal(url, 'https://www.youtube.com', 'URL should match');
            return downloader.init('-o /local').then(instance => {
                assert(!instance, 'Instance should be null');
                return instance;
            }).then(assert.fail).catch(err => {
                assert(err.message.indexOf('required') >= 0, 'Error message must contain invalid');
            });
        });
    });

    it('Should require -o, -out, -output argument with path', function() {
        // Test -o
        return downloader.init('-url https://www.youtube.com -o').then(instance => {
            assert(instance, 'Instance should not be null');
            return instance.getOutputPath();
        }).then(path => {
            assert(path.indexOf('output') >= 0, 'Output path should contain ouput');
            return downloader.init('-url https://www.youtube.com -o local');
        }).then(instance => {
            assert(instance, 'Instance should not be null');
            return instance.getOutputPath();
        }).then(path => {
            assert.equal(path, 'local', 'Output path should be the same');
            // Test -out
            return downloader.init('-url https://www.youtube.com -out');
        }).then(instance => {
            assert(instance, 'Instance should not be null');
            return instance.getOutputPath();
        }).then(path => {
            assert(path.indexOf('output') >= 0, 'Output path should contain ouput');
            return downloader.init('-url https://www.youtube.com -out local');
        }).then(instance => {
            assert(instance, 'Instance should not be null');
            return instance.getOutputPath();
        }).then(path => {
            assert.equal(path, 'local', 'Output path should be the same');
            // Test -output       
            return downloader.init('-url https://www.youtube.com -output');
        }).then(instance => {
            assert(instance, 'Instance should not be null');
            return instance.getOutputPath();
        }).then(path => {
            assert(path.indexOf('output') >= 0, 'Output path should contain ouput');
            return downloader.init('-url https://www.youtube.com -output local');
        }).then(instance => {
            assert(instance, 'Instance should not be null');
            return instance.getOutputPath();
        }).then(path => {
            assert.equal(path, 'local', 'Output path should be the same');
        });
    });

    it('Can have -name argument but not required', function() {
        return downloader.init('-url https://www.youtube.com -name').then(instance => {
            assert(instance, 'Instance should not be null');
            return instance.getName();
        }).then(async name => {
            assert.equal(name, '', 'Should be empty string');
            return downloader.init('-url https://www.youtube.com -name testname');
        }).then(instance => {
            assert(instance, 'Instance should not be null');
            return instance.getName();
        }).then(name => {
            assert.equal(name, 'testname', 'Name should match');
        });
    });

    it('Can have -mp3 argument but not required', function() {
        return downloader.init('-url https://www.youtube.com -mp3').then(instance => {
            assert(instance, 'Instance should not be null');
            return instance.isMP3();
        }).then(result => {
            assert(result, 'Result should be true');
        });
    })
});

describe('Getting URL information', function() {
    var downloader;
    this.beforeEach(() => {
        downloader = new YTDownloader();
    });

    it('Should be able to get information from url', function() {
        return downloader.init('-url https://www.youtube.com/watch?v=Y2rDb4Ur2dw').then(instance => {
            assert(instance, 'Instance should not be null');
            return instance.getURLInfo();
        }).then(info => {
            assert(info, 'Result should not be nulled');
            assert(info.title, 'Should contain video title');
            assert(info.description, 'Should contain video description');
        });
    });

    it('Should be able to get basic information from url', function() {
        return downloader.init('-url https://www.youtube.com/watch?v=Y2rDb4Ur2dw').then(instance => {
            assert(instance, 'Instance should not be null');
            return instance.getURLBasicInfo();
        }).then(info => {
            assert(info, 'Result should not be nulled');
            assert(info.title, 'Should contain video title');
            assert(info.description, 'Should contain video description');
        });
    });

    it('Should be able to get video format from url', function() {
        return downloader.init('-url https://www.youtube.com/watch?v=Y2rDb4Ur2dw').then(instance => {
            assert(instance, 'Instance should not be null');
            return instance.getVideoFormat();
        }).then(info => {
            assert(info, 'Result should not be nulled');
        });
    });
});

describe('Downloading a video', function() {
    var downloader;
    this.beforeEach(() => {
        downloader = new YTDownloader();
    });

    this.timeout('60s')

    it('Should be able to download a video', function() {
        return downloader.init('-url https://www.youtube.com/watch?v=Y2rDb4Ur2dw').then(instance => {
            assert(instance, 'Instance should not be null');
            return instance.download();
        }).then(result => {
            assert(result, 'Result should not be nulled');
            console.log(result);
        });
        // return downloader.deployed().then(function(instance) {
        //     downloaderInstance = instance;
        //     const promise = new Promise((resolve, reject) => {
        //         downloaderInstance.download('https://www.youtube.com/watch?v=Y2rDb4Ur2dw', function(result) {
        //             resolve(result);
        //         });
        //     });
        //     return promise;
        // }).then(function(result) {
        //     assert(result, 'Result should not be nulled');
        //     assert(result.title, 'Should contain video title');
        //     assert(result.description, 'Should contain video description');
        // });
    });
});

