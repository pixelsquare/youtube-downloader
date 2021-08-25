import React, { useEffect } from 'react';
import DownloadDropdown from './DownloadDropdown';
import { makeStyles } from '@material-ui/core/styles';
import { Card, CardActions, CardMedia, CardContent, MenuItem, Typography } from '@material-ui/core';

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
        padding: '1rem',
        overflowY: 'hidden',
        maxHeight: '227px'
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
        height: '180px',
        overflowY: 'auto',
        paddingBottom: '1rem',
        flexGrow: 1,
        textAlign: 'left',
    },
    actionbar: {
        padding: '1rem',
        backgroundColor: 'transparent',
        boxShadow: 'none',
        borderTop: '1px solid rgba(0, 0, 0, 0.14)'
    },
    menuItem: {
        backgroundColor: '#f5f5f5',
        boxShadow: 'none',
        borderBottom: '1px solid rgba(0, 0, 0, 0.14)',
    }
}));

const VideoCardInfo = (props) => {
    const classes = useStyles();
    const { info } = props;

    useEffect(() => {
        console.log(info.qualityList);
    }, [info.qualityList]);

    const handleDropdownClick = e => {
        console.log(e.target.value);
    };

    return (
        <Card raised={true} className={classes.root}>
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
                <DownloadDropdown onClick={handleDropdownClick}>
                    { 
                        info.qualityList ? info.qualityList.map(q => {
                            return <MenuItem value={q.itag} className={classes.menuItem}>{q.quality}</MenuItem>;
                        }) : null
                    }
                </DownloadDropdown>
                </CardActions>
            </CardContent>
        </Card>
    )
};

export default VideoCardInfo;
