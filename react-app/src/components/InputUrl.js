import React, { useEffect, useState } from 'react';
import { TextField } from '@material-ui/core'

const InputUrl = (props) => {

    const [urlInput, setUrlInput] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const id = setTimeout(() => { setMessage(urlInput) }, 100);
        return () => clearTimeout(id);
      }, [urlInput]);
    
      const handleChange = e => {
        setUrlInput(e.target.value);
        console.log(urlInput);
      };

    return (
        <div>
            <TextField type="text" label="Youtube URL" value={urlInput} onChange={handleChange} style={{ width: "100%" }}></TextField>
            <p>{message}</p>
        </div>
    )
};

export default InputUrl;