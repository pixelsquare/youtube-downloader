import React, { useEffect, useState } from 'react';
import Root from './navigation/Root';
import URLInput from './components/URLInput';
import VideoCardInfo from './components/VideoCardInfo';
import VideoCardFail from './components/VideoCardFail';
import VideoCardLoader from './components/VideoCardLoader';

import './css/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';

const downloader = require('./lib/index.js');

// https://www.youtube.com/watch?v=LXb3EKWsInQ
// https://www.youtube.com/watch?v=ig3Qa6IINYo

function App() {

  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [videoInfo, setVideoInfo] = useState({});

  useEffect(() => {

    // downloader.getURLInfo('https://www.youtube.com/watch?v=ig3Qa6IINYo').then(result => {
    //     console.log(result);
    //     setVideoInfo({
    //       title: result.videoDetails.title,
    //       description: result.videoDetails.description,
    //       imageUrl: result.videoDetails.thumbnails[result.videoDetails.thumbnails.length - 1].url
    //     });

    // }).catch(err => {

    // });

  }, []);

  var timeoutId = null;
  const handleChange = e => {
    const url = e.target.value;
    setUrl(url);
    
    clearTimeout(timeoutId);
    setErrorMessage(null);

    if(url) {
      setIsLoading(true);
      timeoutId = setTimeout(() => {
        downloader.getURLInfo(url).then(result => {
          // console.log(result);

          setIsLoading(false);
          setVideoInfo({
            title: result.videoDetails.title,
            description: result.videoDetails.description,
            imageUrl: result.videoDetails.thumbnails[result.videoDetails.thumbnails.length - 1].url,
            qualityList: downloader.getAvailableQuality(result)
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

  const renderCard = () => {
    return !errorMessage ? <VideoCardInfo info={videoInfo} /> : <VideoCardFail message={errorMessage} />;
  };

  return (
    <div className="App">
      <Root>
        <URLInput onChange={handleChange} />
        { url ? (isLoading ? <VideoCardLoader /> : renderCard()) : null }
      </Root>
    </div>
  );
}

export default App;
