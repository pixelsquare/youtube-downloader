const { utils: { fromBuildIdentifier } } = require('@electron-forge/core');

module.exports = {    
    buildIdentifier: 'electron-react-demo',
    packagerConfig: {
        appBundleId: fromBuildIdentifier({ beta: 'com.beta.pxlsqr.electron-react-demo', prod: 'com.pxlsqr.electron-react-demo' })
    },
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
    }
};