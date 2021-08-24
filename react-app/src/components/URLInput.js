import React from 'react';
import { TextField } from '@material-ui/core'

const URLInput = (props) => {
    const  { value, onChange } = props;
    return ( <TextField type="text" label="Youtube URL" value={value} onChange={onChange} style={{ width: "100%", margin: "1rem 0" }}></TextField> )
};

export default URLInput;