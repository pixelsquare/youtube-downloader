import React from 'react';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    header: {
        padding: '1rem 0',
        backgroundColor: 'transparent',
        boxShadow: 'none',
        borderBottom: '1px solid rgba(0, 0, 0, 0.14)'
    }
}));

const Header = (props) => {
    const classes = useStyles();
    
    return ( <Typography variant="h4" className={classes.header}>Youtube Downloader</Typography> );
};

export default Header;