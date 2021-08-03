'use strict'

const assert = require('assert');
const downloader = require('../index.js');

describe('Initializes with arguments', function() {
    var downloaderInstance;

    it('Empty argument should fail', function() {
        return downloader.deployed().then(function(instance) {
            downloaderInstance = instance;
            return downloaderInstance.init();
        }).then(function(result) {
            assert(!result, 'Should fail');
        });
    });

    it('Should require -url argument with valid url', function() {
        return downloader.deployed().then(function(instance) {
            downloaderInstance = instance;
            return downloaderInstance.init('-url https://www.youtube.com -o /local');
        }).then(function(result) {
            assert(result, 'Result must succeed!');
            return downloaderInstance.getURL();
        }).then(function(url) {
            assert.equal(url, 'https://www.youtube.com', 'URL should match');
        });
    });

    it('Should require -o, -out, -output argument with path', function() {
        return downloader.deployed().then(function(instance) {
            downloaderInstance = instance;
            return downloaderInstance.init('-url https://www.youtube.com -o /local-test');
        }).then(function(result) {
            assert(result, 'Result must succeed');
            return downloaderInstance.getOutputPath();
        }).then(function(result) {
            assert.equal(result, '/local-test', 'Output path must be the same');
            return downloaderInstance.init('-url https://www.youtube.com -out /local-test-1');
        }).then(function(result) {
            assert(result, 'Result must succeed');
            return downloaderInstance.getOutputPath();
        }).then(function(result) {
            assert.equal(result, '/local-test-1', 'Output path must be the same');
            return downloaderInstance.init('-url https://www.youtube.com -output /local-test-2');
        }).then(function(result) {
            assert(result, 'Result must succeed');
            return downloaderInstance.getOutputPath();
        }).then(function(result) {
            assert.equal(result, '/local-test-2', 'Output path must be the same');
            return downloaderInstance.init('-url https://www.youtube.com');
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('required') > -1, 'Missing output path should fail');
        });
    });

    it('Can have -name argument but not required', function() {
        return downloader.deployed().then(function(instance) {
            downloaderInstance = instance;
            return downloaderInstance.init('-url https://www.youtube.com -o /local -name test');
        }).then(function(result) {
            assert(result, 'Result must succeed!');
            return downloaderInstance.getName();
        }).then(function(name) {
            assert.equal(name, 'test', 'Name should match');
        });
    });

    it('Can have -mp3 argument but not required', function() {
        return downloader.deployed().then(function(instance) {
            downloaderInstance = instance;
            return downloaderInstance.init('-url https://www.youtube.com -o /local -name test -mp3');
        }).then(function(result) {
            assert(result, 'Result must succeed!');
            return downloaderInstance.isMP3();
        }).then(function(result) {
            assert(result, 'Result must be true');
        });
    })
});

describe('Getting URL information', function() {
    var downloaderInstance;

    it('Should be able to get information from url', function() {
        return downloader.deployed().then(function(instance) {
            downloaderInstance = instance;
            return downloaderInstance.getURLInfo('https://www.youtube.com/watch?v=Y2rDb4Ur2dw');
        }).then(function(result) {
            assert(result, 'Result should not be nulled');
            assert(result.title, 'Should contain video title');
            assert(result.description, 'Should contain video description');
            return downloaderInstance.getURLInfo('https://www.youtube.com/watch?v=Y2rDb4Ur2d');
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('Failed') > -1, 'Invalid url must fail');
        });
    });

    it('Should be able to get basic information from url', function() {
        return downloader.deployed().then(function(instance) {
            downloaderInstance = instance;
            return downloaderInstance.getURLBasicInfo('https://www.youtube.com/watch?v=Y2rDb4Ur2dw');
        }).then(function(result) {
            assert(result, 'Result should not be nulled');
            assert(result.title, 'Should contain video title');
            assert(result.description, 'Should contain video description');
            return downloaderInstance.getURLBasicInfo('https://www.youtube.com/watch?v=Y2rDb4Ur2d');
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('Failed') > -1, 'Invalid url must fail');
        });
    });
});

describe('Downloading a video', function() {
    var downloaderInstance;

    it('Should contain proper url', function() {
        return downloader.deployed().then(function(instance) {
            downloaderInstance = instance;
            const promise = new Promise((resolve, reject) => {
                downloaderInstance.download('https://www.youtube.com/watch?v=Y2rDb4Ur2dw', function(result) {
                    resolve(result);
                });
            });
            return promise;
        }).then(function(result) {
            assert(result, 'Result should not be nulled');
            assert(result.title, 'Should contain video title');
            assert(result.description, 'Should contain video description');
        });
    });
});

