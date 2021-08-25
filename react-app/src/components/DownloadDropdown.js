import React from 'react'
import GetAppRoundedIcon from '@material-ui/icons/GetAppRounded';
import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import { Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';


const useStyles = makeStyles((theme) => ({
    root: {},
    dropdown: {
        position: 'absolute',
        minWidth: '165px',
        maxHeight: '200px',
        overflowY: 'auto',
    },
}));

const DownloadDropdown = (props) => {
    const classes = useStyles();
    const { onClick } = props;

    return (
        <div className="dropdown dropup">
            <Button 
                id="dropdown"
                data-bs-toggle="dropdown"
                variant="outlined" 
                size="medium" 
                color="primary"
                startIcon={<GetAppRoundedIcon />}
                endIcon={<ExpandMoreRoundedIcon />}>
                    Download
            </Button>
            <ul className={`dropdown-menu ${classes.dropdown}`} aria-labelledby="dropdown">
                { 
                    React.Children.map(props.children, child => {
                        return React.cloneElement(child, {
                            onClick: onClick
                        });
                    })
                }
            </ul>
        </div>
    )
};

export default DownloadDropdown;
