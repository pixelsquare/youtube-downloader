import React, { useEffect, useState } from 'react';
import Root from './navigation/Root';
import URLInput from './components/URLInput';
import VideoCardInfo from './components/VideoCardInfo';
import VideoCardFail from './components/VideoCardFail';
import VideoCardLoader from './components/VideoCardLoader';
import { getURLInfo, getAvailableQuality, download } from './utils/Downloader';

import './css/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';

// const downloader = require('./lib/index.js');

// https://www.youtube.com/watch?v=LXb3EKWsInQ
// https://www.youtube.com/watch?v=ig3Qa6IINYo

function App() {

  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [videoCardInfo, setVideoCardInfo] = useState({});
  const [videoInfo, setVideoInfo] = useState({})
  const [downloadInfo, setDownloadInfo] = useState({ eta: 0, speed: 0, progress: 0 });

  useEffect(() => {

    // downloader.getURLInfo('https://www.youtube.com/watch?v=ig3Qa6IINYo').then(result => {
    //     console.log(result);
    //     setVideoCardInfo({
    //       title: result.videoDetails.title,
    //       description: result.videoDetails.description,
    //       imageUrl: result.videoDetails.thumbnails[result.videoDetails.thumbnails.length - 1].url
    //     });

    // }).catch(err => {

    // });

  }, []);

  var timeoutId = null;
  const handleChange = e => {
    const url = e.target.value.trim();
    setUrl(url);
    
    clearTimeout(timeoutId);
    setErrorMessage(null);

    if(url) {
      setIsLoading(true);
      timeoutId = setTimeout(() => {
        getURLInfo(url).then(result => {
          setIsLoading(false);
          setVideoInfo(result);
          setVideoCardInfo({
            title: result.videoDetails.title,
            description: result.videoDetails.description,
            imageUrl: result.videoDetails.thumbnails[result.videoDetails.thumbnails.length - 1].url,
            qualityList: getAvailableQuality(result)
          });
    
        }).catch(err => {
          setErrorMessage(err.message);
          setIsLoading(false);
        });
  
      }, 500);

    }
    else {
      setVideoInfo({});
      setIsLoading(false);
    }

    e.preventDefault();
  }

  const handleDownloadProgress = (data) => {
    // console.log(data.progress * 100);
    setDownloadInfo({
        eta: parseInt(data.eta),
        speed: data.speed,
        progress: Math.round(data.progress * 100)
    });
  }

  const onDownload = e => {
    setIsDownloading(true);
    download(videoInfo, e.target.value, handleDownloadProgress).then(result => {
      console.log(result);
      setIsDownloading(false);
      setDownloadInfo({ eta: 0, speed: 0, progress: 0 });
    }).catch(err => {
      if(err) {
        console.log(err);
      }
      setIsDownloading(false);
      setDownloadInfo({ eta: 0, speed: 0, progress: 0 });
    });
  }

  const renderCard = () => {
    return !errorMessage 
            ? <VideoCardInfo 
                videoInfo={videoCardInfo}
                downloadInfo={downloadInfo}
                isDownloading={isDownloading}
                onDownload={onDownload} /> 
            : <VideoCardFail message={errorMessage} />;
  };

  return (
    <div className="App">
      <Root>
        <URLInput onChange={handleChange} downloading={isDownloading} />
        { url 
          ? (isLoading 
            ? <VideoCardLoader /> 
            : renderCard()) 
          : null 
        }
      </Root>
    </div>
  );
}

export default App;
