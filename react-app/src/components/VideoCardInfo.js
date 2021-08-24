import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Card, CardActions, CardMedia, CardContent, Button, Typography } from '@material-ui/core';
import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';

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
        padding: '0.5rem'
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
        flexGrow: 1,
        textAlign: 'left'
    },
    actionbar: {
        backgroundColor: 'transparent',
        boxShadow: 'none',
        borderTop: '1px solid rgba(0, 0, 0, 0.14)'
    }
}));

const VideoCardInfo = (props) => {
    const classes = useStyles();
    const { info } = props;

    return (
        <Card className={classes.root}>
            <CardMedia 
                component="img"
                alt=""
                height="280"
                image={info.imageUrl}
                title=""
                className={classes.media}
            />

            <CardContent className={classes.content}>
                <CardContent className={classes.info}>
                    <Typography gutterBottom variant="h5" component="h2" className={classes.title}>{info.title}</Typography>
                    <Typography variant="body2" color="textSecondary" component="p" className={classes.description}>{info.description}</Typography>
                </CardContent>

                <CardActions className={classes.actionbar}>
                    <Button 
                        variant="outlined" 
                        size="medium" 
                        color="primary"
                        endIcon={<ExpandMoreRoundedIcon />}>
                            Download
                    </Button>
                </CardActions>
            </CardContent>
        </Card>
    )
};

export default VideoCardInfo;
