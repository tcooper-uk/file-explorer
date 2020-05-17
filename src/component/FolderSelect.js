import React, {useEffect, useState} from 'react';

export default function FolderSelect({hasErrors, onChange}) {

    const [dataPath, setPath] = useState(() => {
        return window.localStorage.getItem('folder-path') || window.dataDirectory;
    });

    useEffect(() => {
        window.localStorage.setItem('folder-path', dataPath);
    }, [dataPath]);


    let onChangeHandler = (event) => {
        setPath(event.target.value);
    }

    let onBlurHandler = (event) => {
        setPath(event.target.value);
        onChange(event.target.value);
    }

    let classStr = 'path-input';
    if (hasErrors === true) {
        classStr = classStr + ' error';
    }


    return (
        <input className={classStr} type="text" onChange={onChangeHandler} onBlur={onBlurHandler} value={dataPath} />
    );
}