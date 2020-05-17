import React, {useEffect, useState} from 'react';
import Tree from 'react-d3-tree';

export default function TreeGraph(props) {

    const [translate, setTranslate] = useState({});

    useEffect(() => {

        const dimensions = props.parentRef.current.getBoundingClientRect();
        setTranslate({
          x: dimensions.width / 2,
          y: dimensions.height / 4
        });
    
      }, [props.data, props.parentRef])

    return (
        <>
            {
                props.errors.length > 0 ?
                props.errors :
                <Tree 
                    data={props.data} 
                    orientation={'vertical'}
                    translate={translate}
                    separation={{
                    siblings: 1.5,
                    nonSiblings: 2
                    }}
                />
            }
        </>
    );
}