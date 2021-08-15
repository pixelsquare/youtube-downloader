'use strict';

const getUsage = require('command-line-usage');
const commandLineArgs = require('command-line-args');
const YTDownloader = require('./YoutubeDownloader');

const optionDefinitions = [
  {
    name: 'help',
    description: 'Display this usage guide.\n',
    alias: 'h',
    type: Boolean
  },
  {
    name: 'title',
    description: 'The video output filename.\n',
    alias: 't',
    type: String,
    typeLabel: '{underline filename}'
  },
  {
    name: 'url',
    description: 'Youtube URL.\n',
    type: String,
    defaultOption: true,
    typeLabel: '{underline uri}'
  },
  {
    name: 'output',
    description: 'Output path.\n',
    alias: 'o',
    type: String,
    typeLabel: '{underline path}'
  },
  {
    name: 'quality',
    description: 'Video quality.\n',
    alias: 'q',
    type: String,
    typeLabel: '{underline quality}'
  },
  {
    name: 'ext',
    description: 'Video output extension.\n',
    type: String,
    typeLabel: '{underline extension}'
  },
  {
    name: 'preset',
    description: 'Video preset.\n',
    alias: 'p',
    type: String,
    typeLabel: '{underline preset}'
  },
  {
    name: 'mp3',
    description: 'Download audio only.\n',
    type: Boolean
  }
]

const sections = [
  {
    header: 'Youtube Downloader',
    content: [
        'Developed by: PixelSquare (a.ganzon)'
    ]
  },
  {
    header: 'Options',
    optionList: optionDefinitions
  }
]

const options = commandLineArgs(optionDefinitions);

if(options.url) {
    var opts = {
        title: options.title,
        url: options.url,
        output: options.output ,
        quality: options.quality,
        ext: options.ext,
        preset: options.preset,
        itag: options.itag,
        isMp3: options.mp3,
        force: options.force
    };

    const downloader = new YTDownloader(opts);
    downloader.download().then(result => {
        console.log(result);
    });
}

if(options.help) {
    console.log(getUsage(sections));
}