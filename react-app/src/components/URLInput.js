import React from 'react';
import { TextField } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles';

const StyledTextField = withStyles((theme) => ({
    root: {
        width: '100%',
        margin: '1rem 0'
    }
}))(TextField)

const URLInput = (props) => {
    const  { value, onChange, downloading } = props;
    return ( <StyledTextField type="text" label="Youtube URL" value={value} onChange={onChange} disabled={downloading}></StyledTextField> )
};

export default URLInput;