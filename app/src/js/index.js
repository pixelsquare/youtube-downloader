'use strict'

const downloader = require('./js/downloader.js');
window.$ = window.jQuery = require('jquery');

const setCardInfo = (info) => {
    const titleElement = document.querySelector('#vid-title');
    const descriptionElement = document.querySelector('#vid-desc');
    const thumbnailElement = document.querySelector('#vid-thumbnail');
    const qualityDropdown = document.querySelector('#quality-dropdown');

    titleElement.innerHTML = info.title; // truncate(info.title, 30);
    descriptionElement.innerHTML = info.description;
    thumbnailElement.src = info.thumbnail;

    info.qualityList.forEach(e => {
        const li = document.createElement('li');
        li.classList.add('py-1');
    
        const a = document.createElement('a');
        a.classList.add('text-center');
        a.classList.add('p-0');
        a.onclick = evnt => {
            console.log(e);
            evnt.preventDefault();
        };
        a.innerHTML = e.quality;

        li.appendChild(a);
        qualityDropdown.appendChild(li);
    });
}

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

     downloader.getUrlInfo('https://www.youtube.com/watch?v=LXb3EKWsInQ').then(result => {
        console.log(result);
        setCardInfo({
            title: result.videoDetails.title,
            description: result.videoDetails.description,
            thumbnail: result.videoDetails.thumbnails[result.videoDetails.thumbnails.length - 1].url,
            qualityList: downloader.getVideoQuality(result.formats)
        })
     });

    //  const videoDetails = document.querySelector('#video-details');
    //  const videoInfo = document.querySelector('#video-info');
    //  const videoLoader = document.querySelector('#video-loader');

    // const setVideoDetailsVisible = (visible) => {
    //     if(visible) {
    //         videoDetails.classList.remove('hide');
    //     }
    //     else {
    //         videoDetails.classList.add('hide');
    //     }
    // };

    // const setVideoInfoVisible = (visible) => {
    //     if(visible) {
    //         videoInfo.classList.remove('hide');
    //     }
    //     else {
    //         videoInfo.classList.add('hide');
    //     }
    // };

    // const setVideoLoaderVisible = (visible) => {
    //     if(visible) {
    //         videoLoader.classList.remove('hide');
    //     }
    //     else {
    //         videoLoader.classList.add('hide');
    //     }
    // };

    // const calculateAspectRatio = (srcW, srcH, maxW, maxH) => {
    //     var ratio = Math.max(maxW / srcW, maxH / srcH);
    //     return { width: srcW * ratio, height: srcH * ratio };
    // };
    
    // setVideoDetailsVisible(false);
    // setVideoInfoVisible(false);
    // setVideoLoaderVisible(false);

    // const videoTitle = document.querySelector('#vid-title');
    // const videoDescription = document.querySelector('#vid-desc');
    // const videoThumbnail = document.querySelector('#vid-thumbnail');

    // // https://www.youtube.com/watch?v=LUsb-SQi4ME
    // var timer;
    // $('#yt-url').on('input', e => {
    //     var input = e.target.value;
    //     clearTimeout(timer);
    //     if(input) {
    //         timer = setTimeout(() => {
    //             setVideoDetailsVisible(true);
    //             setVideoLoaderVisible(true);
    //             setVideoInfoVisible(false);

    //             downloader.getUrlInfo(input).then(result => {
    //                 if(result) {
    //                     setVideoDetailsVisible(true);
    //                     setVideoLoaderVisible(false);
    //                     setVideoInfoVisible(true);

    //                     videoTitle.innerHTML = result.title;
    //                     videoDescription.innerHTML = result.description;

    //                     const thumbnail = result.thumbnails[result.thumbnails.length - 1];
    //                     videoThumbnail.src = thumbnail.url;

    //                     const size = calculateAspectRatio(thumbnail.width, thumbnail.height, 265, 265);
    //                     videoThumbnail.style.width = '120px';
    //                     videoThumbnail.style.height = '100%';
    //                     // videoThumbnail.style.width = size.width + 'px';
    //                     // videoThumbnail.style.height = size.height + 'px';
    //                 }

    //             });

    //         }, 500);

    //     }
    //     else {
    //         setVideoDetailsVisible(false);
    //         setVideoInfoVisible(false);
    //         setVideoLoaderVisible(true);
    //     }
    // });
}, false);



window.addEventListener('resize', () => {
    console.log(window.innerWidth + 'x' + window.innerHeight);
});