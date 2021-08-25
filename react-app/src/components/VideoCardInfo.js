import React, { useState } from 'react';
import DownloadDropdown from './DownloadDropdown';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import PauseRoundedIcon from '@material-ui/icons/PauseRounded';
import PlayArrowRoundedIcon from '@material-ui/icons/PlayArrowRounded';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { Card, CardActions, CardMedia, CardContent, MenuItem, LinearProgress, IconButton, Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'row'
    },
    media: {
        maxWidth: '150px'
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        padding: '0px!important',
        minWidth: '0px'
    },
    info: {
        flexGrow: 1,
        padding: '0.5rem 1rem',
        overflowY: 'hidden',
        maxHeight: '211px'
    },
    title: {
        textAlign: 'left',
        backgroundColor: 'transparent',
        boxShadow: 'none',
        borderBottom: '1px solid rgba(0, 0, 0, 0.14)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    description: {
        height: '155px',
        overflowY: 'auto',
        paddingBottom: '0.5rem',
        flexGrow: 1,
        textAlign: 'left',
    },
    actionBar: {
        flexGrow: 1,
        padding: '0.5rem 1rem',
        backgroundColor: 'transparent',
        boxShadow: 'none',
        borderTop: '1px solid rgba(0, 0, 0, 0.14)',
        maxHeight: '70px'
    },
    icon: {
        margin: theme.spacing(1)
    },
    progressBar: {
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        alignItems: 'center',
        paddingTop: '1.5rem'
    },
    progressDetails: {
        display: 'flex',
        flexDirection: 'row'
    },
    progressInfo: {
        padding: '0.2rem 0.5rem'
    }
}));

const StyledProgressBar = withStyles((theme) => ({
    root: {
        height: '5px',
        width: '100%',
        borderRadius: '5px',
        // translate: 'translate(-100px, 0)'
    },
    bar: {
        borderRadius: '5px',
        backgroundColor: '#1a90ff',
        transform: 'translateX(-100%)'
    }
}))(LinearProgress);

const VideoCardInfo = (props) => {
    const classes = useStyles();
    const { videoInfo, downloadInfo, isDownloading, onDownload } = props;
    const [isPaused, setIsPaused] = useState(false);

    const renderDownloadButton = () => {
        return (
            <DownloadDropdown onClick={handleClick}>
                { 
                    videoInfo.qualityList ? videoInfo.qualityList.map(q => {
                        return <MenuItem divider value={q.itag}>{q.quality}</MenuItem>;
                    }) : null
                }
            </DownloadDropdown>);
    };

    const renderProgress = () => {
        return (
            <React.Fragment>
                <Typography variant="body1" color="textSecondary" component="p">{downloadInfo.progress}%</Typography>
                <div className={classes.progressBar}>
                    <StyledProgressBar aria-valuenow='0' aria-valuemin='0' aria-valuemax='100' variant="determinate" value={downloadInfo.progress}/>
                    <div className={classes.progressDetails}>
                        <Typography variant="caption" color="textSecondary" component="p" className={classes.progressInfo}>ETA: { downloadInfo.eta < 0 ? 'N/A' :  downloadInfo.eta + 's'}</Typography>
                        <Typography variant="caption" color="textSecondary" component="p" className={classes.progressInfo}>Speed: {downloadInfo.speed} Mb/s</Typography>
                    </div>
                </div>
                <IconButton aria-label="play-pause" size="small" className={classes.icon}>{isDownloading && !isPaused ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}</IconButton>
                <IconButton aria-label="close" size="small" className={classes.icon}><CloseRoundedIcon /></IconButton>
            </React.Fragment>)
    };

    const handleClick = e => {
        onDownload(e);
    };

    return (
        <Card raised={true} className={classes.root}>
            <CardMedia 
                component="img"
                alt=""
                height="280"
                image={videoInfo.imageUrl}
                title=""
                className={classes.media}
            />

            <CardContent className={classes.content}>
                <CardContent className={classes.info}>
                    <Typography gutterBottom variant="h5" component="h2" className={classes.title}>{videoInfo.title}</Typography>
                    <Typography variant="body2" color="textSecondary" component="p" className={classes.description}>{videoInfo.description}</Typography>
                </CardContent>

                <CardActions className={classes.actionBar}>
                    { !isDownloading ? renderDownloadButton() : renderProgress() }
                </CardActions>
            </CardContent>
        </Card>
    )
};

export default VideoCardInfo;
