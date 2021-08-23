'use strict'

const fs = require('fs');
const path = require('path');

const { utils: { fromBuildIdentifier } } = require('@electron-forge/core');
const { ora } = require('@electron-forge/async-ora');

module.exports = {
    packagerConfig: {},
    electronRebuildConfig: {},
    makers: [
        {
            "name": "@electron-forge/maker-squirrel",
            "config": { "name": "youtube_downloader" }
        },
        {
            "name": "@electron-forge/maker-zip",
            "platforms": [ "darwin" ]
        },
        {
            "name": "@electron-forge/maker-deb",
            "config": {}
        },
        {
            "name": "@electron-forge/maker-rpm",
            "config": {}
        }
    ],
    publishers: [],
    plugins: [],
    hooks: {
        generateAssets: async (config, options) => {
            // console.log(`\ngenerateAssets ${config} ${options}`);
        },
        postStart: async (config, options) => {
            // console.log(`\npostStart ${config} ${options}`);
        },
        preStart: async (config, options) => {
            // console.log(`\npreStart ${config} ${options}`);
        },
        prePackage: async (config, options) => {
            // console.log(`\nprePackage ${config} ${options}`);
        },
        packageAfterCopy: async (config, options) => {
            // console.log(`\npackageAfterCopy ${config} ${options}`);
        },
        packageAfterPrune: async (config, options) => {
            // console.log(`\npackageAfterPrune ${config} ${options}`);
        },
        packageAfterExtract: async (config, options) => {
            // console.log(`\npackageAfterExtract ${config} ${options}`);
        },
        postPackage: async (config, options) => {
            // console.log(`\npostPackage ${config} ${options}`);
            
            if(options.spinner) {
                options.spinner.succeed(`Completed packaging for ${options.platform} / ${options.arch} at ${options.outputPaths[0]}`);

                if(options.outputPaths && options.outputPaths.length > 0) {
                    const copySpinner = ora('Copying required libraries').start();

                    const srcDir = path.resolve('./../ffmpeg');
                    const destDir = path.join(options.outputPaths[0], '/resources/app');
                    if(fs.existsSync(srcDir) && fs.existsSync(destDir)) {
                        copyDirectorySync(srcDir, destDir);
                        copySpinner.succeed();
                    }
                }
            }

        },
        preMake: async (config, options) => {
            // console.log(`\npreMake ${config} ${options}`);
        },
        postMake: async (config, options) => {
            // console.log(`\npostMake ${config} ${options}`);
        },
        readPackageJson: async (config, options) => {
            // console.log(`\nreadPackageJson ${config} ${options}`);
        }
    },
    buildIdentifier: 'youtube-downloader',
    packagerConfig: {
        appBundleId: fromBuildIdentifier({ beta: 'com.beta.pxlsqr.youtube-downloader', prod: 'com.pxlsqr.youtube-downloader' })

    }
};

const copyFileSync = async (src, dest) => {
    var target = dest;

    if(fs.existsSync(target)) {
        if(fs.lstatSync(target).isDirectory()) {
            target = path.join(target, path.basename(src));
        }
    }

    fs.writeFileSync(target, fs.readFileSync(src));
}

const copyDirectorySync = async (src, dest) => {
    var files = [];

    var target = path.join(dest, path.basename(src));
    if(!fs.existsSync(target)) {
        fs.mkdirSync(target);
    }

    if(fs.lstatSync(src).isDirectory()) {
        files = fs.readdirSync(src);
        files.forEach(file => {
            var curSrc = path.join(src, file);
            if(fs.lstatSync(curSrc).isDirectory()) {
                copyDirectorySync(curSrc, target);
            }
            else {
                copyFileSync(curSrc, target);
            }
        });
    }
}