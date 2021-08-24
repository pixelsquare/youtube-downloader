'use strict'

const ytdl = require('ytdl-core');

module.exports = {
    getURLInfo: async (url) => {
        if(url && ytdl.validateURL(url)) {
            try {
                return await ytdl.getInfo(url);
            }
            catch(err) {
                const error = {
                    function: 'getURLInfo', 
                    message: 'Unable to get info from URL', 
                    payload: err.message
                };
                
                return Promise.reject(error);
            }
        }

        const error = {
            function: 'getURLInfo', 
            message: 'Invalid URL', 
            payload: url
        };

        return Promise.reject(error);
    },
    getURLBasicInfo: async (url) => {
        if(url && ytdl.validateURL(url)) {
            try {
                return await ytdl.getBasicInfo(url);
            }
            catch(err) {
                const error = {
                    function: 'getURLBasicInfo', 
                    message: 'Unable to get info from URL', 
                    payload: err.message
                };
                
                return Promise.reject(error);
            }
        }

        const error = {
            function: 'getURLInfo', 
            message: 'Invalid URL', 
            payload: url
        };

        return Promise.reject(error);
    },
    getVideoDetails: async (url) => {
        if(url && ytdl.validateURL(url)) {
            try {
                const info = await ytdl.getInfo(url);
                return info.videoDetails;
            }
            catch(err) {
                const error = {
                    function: 'getURLInfoAsync', 
                    message: 'Unable to get info from URL', 
                    payload: err.message
                };

                return Promise.reject(error);
            }
        }

        const error = {
            function: 'getURLInfo', 
            message: 'Invalid URL', 
            payload: url
        };

        return Promise.reject(error);
    },
    getAvailableQuality: (info) => {
        var qualityList = [];
        info.formats.forEach(i => {
            if(i.qualityLabel && !qualityList.includes(i.qualityLabel)) {
                qualityList.push({
                    itag: i.itag,
                    quality: i.qualityLabel,
                    container: i.container
                });
            }
        });

        qualityList.sort((a, b) => parseInt(b.itag) - parseInt(a.itag));

        var result = [];
        qualityList.forEach(i => {
            if(!result.some(e => e.quality === i.quality)) {
                result.push(i);
            }
        });
        
        result.sort((a, b) => parseInt(b.quality) - parseInt(a.quality));

        return result;
    },
    download: async (info, options) => {
        var stream = null;

        if(info) {
            try {
                stream = await ytdl.downloadFromInfo(info, options);
            }
            catch(err) {
                const error = {
                    function: 'download', 
                    message: 'Unable to get info from URL', 
                    payload: err.message
                };

                return Promise.reject(error);
            }
        }

        return stream;
    }
};