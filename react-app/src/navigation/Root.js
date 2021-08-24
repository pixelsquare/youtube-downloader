import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { Container } from '@material-ui/core';

const Root = (props) => {
    return (
        <div className="d-flex flex-column" style={{ minHeight: "100vh"}}>
            <Header />
                <Container fixed style={{ padding: "1rem 0", flexGrow: 1 }}>{props.children}</Container>
            <Footer />
        </div>
    );
};

export default Root;