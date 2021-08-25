import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress, Paper } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'row',
        height: '280px',
        border: '1px solid rgba(0, 0, 0, 0.12)'
    },
    progress: {
        margin: 'auto'
    }
}));

const VideoCardLoader = (props) => {
    const classes = useStyles();

    return ( 
        <Paper variant="outlined" elevation={3} className={classes.root}>
            <CircularProgress className={classes.progress} /> 
        </Paper>
    )
};

export default VideoCardLoader;
