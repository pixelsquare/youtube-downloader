import React from 'react';
import { Typography } from '@material-ui/core';

const Header = (props) => {
    return ( <Typography variant="h4" className="py-3" style={{ backgroundColor: "transparent", boxShadow: "none", borderBottom: "1px solid rgba(0, 0, 0, 0.14)" }}>Youtube Downloader</Typography> );
};

export default Header;