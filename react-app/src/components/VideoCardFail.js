import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Paper, Typography } from '@material-ui/core';
import ErrorOutlineRoundedIcon from '@material-ui/icons/ErrorOutlineRounded';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'row',
        padding: '1rem',
        border: '1px solid rgba(255, 255, 255, 1)',
        borderColor: '#f5c6cb',
        backgroundColor: '#f8d7da'
    },
    icon: {
        height: '30px',
        lineHeight: '30px',
        margin: '0 0.5rem',
        fontColor: '#ff0000'
    }
}));

const VideoCardFail = (props) => {
    const classes = useStyles();
    const { message } = props;

    return (
        <Paper variant="outlined" elevation={3} className={classes.root}>
            <ErrorOutlineRoundedIcon className={classes.icon} />
            <Typography variant="h5">{message}</Typography>
        </Paper>
    )
};

export default VideoCardFail;
