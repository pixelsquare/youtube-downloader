import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { Container } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh'
    },
    header: {},
    content: {
        flexGrow: 1
    },
    footer: {}
}));

const Root = (props) => {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <Header className={classes.header} />
                <Container className={classes.content} fixed>{props.children}</Container>
            <Footer className={classes.footer} />
        </div>
    );
};

export default Root;