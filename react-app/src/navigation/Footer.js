import React from 'react';

const Footer = (props) => {
    return (
        <footer className="footer text-center py-2" style={{ lineHeight: "20px", backgroundColor: "#f5f5f5" }}>
            <small className="text-muted" style={{ fontSize: "small" }} dangerouslySetInnerHTML={{__html: "Developed by pixelsquare<br/>@2021 All Rights Reserved."}}></small>
        </footer>
    );
};

export default Footer;