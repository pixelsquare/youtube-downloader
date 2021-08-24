import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    footer: {
        textAlign: 'center',
        padding: '0.5rem 0',
        lineHeight: '20px',
        backgroundColor: '#f5f5f5'
    }
}));

const Footer = (props) => {
    const classes = useStyles();
    
    return (
        <footer className={classes.footer}>
            <small className="text-muted" style={{ fontSize: "small" }} dangerouslySetInnerHTML={{__html: "Developed by pixelsquare<br/>@2021 All Rights Reserved."}}></small>
        </footer>
    );
};

export default Footer;