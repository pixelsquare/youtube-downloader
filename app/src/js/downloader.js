'use strict'

const ytdl = require('ytdl-core');

module.exports = {
    getUrlInfo: async (url) => {
        var info;

        if(!url || !ytdl.validateURL(url)) {
            return Promise.resolve(null);
        }

        try {
            info = await (await ytdl.getInfo(url));
        }
        catch(err) {
            console.log(err);
        }

        return info;
    },
    getVideoQuality: (formats) => {
        var qualityList = [];
        formats.forEach(i => {
            if(i.qualityLabel && !qualityList.includes(i.qualityLabel)) {
                qualityList.push({
                    itag: i.itag,
                    quality: i.qualityLabel,
                    container: i.container
                });
            }
        });

        qualityList.sort((a, b) => parseInt(b.itag) - parseInt(a.itag));

        var quality = [];
        qualityList.forEach(i => {
            if(!quality.some(e => e.quality === i.quality)) {
                quality.push(i);
            }
        });

        quality.sort((a, b) => parseInt(b.quality) - parseInt(a.quality));
        return quality;
    }
};
