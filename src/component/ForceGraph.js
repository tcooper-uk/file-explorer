import React, {useEffect, useState, useRef, useCallback} from 'react';
import ForceGraph3D from 'react-force-graph-3d';

export default function ForceGraph({data, clusters=[]}) {

    const [graphData, setGraphData] = useState();

    const graphRef = useRef();

    const nodes = [];
    let links = [];

    useEffect(() => {

        parseTree(data, null, null);
        setGraphData({ nodes, links });

        graphRef.current.d3Force('charge').strength(-60);
    }, [data]);

    const parseTree = (data, parentHash)  => {

      let color = data.type === 'folder' ? '#20639B' : '#F6D55C'
      let size = data.size / 1024;

      // graph node
      const node = {
          id: data.id,
          path: data.path,
          name: data.name,
          type: data.type,
          size: size,
          color: color
        };
        nodes.push(node);

      
      // link child nodes
      if(parentHash !== null) {
        links.push({source: data.id, target: parentHash});
      }

      // repeat
      if(data.children){
        data.children.forEach((c) => {
          parseTree(c, data.id);
        });
      }
    };

    const handleClick = useCallback(node => {
      // Aim at node from outside it
      const distance = 40;
      const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

      graphRef.current.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
        node, // lookAt ({ x, y, z })
        3000  // ms transition duration
      );
    }, [graphRef]);

    return (
        <ForceGraph3D 
            ref={graphRef}
            graphData={graphData}
            backgroundColor="#242424"
            nodeColor="color"
            nodeLabel={(n) => n.path}
            nodeVal={(n) => n.count}
            linkDirectionalParticles={4}
            onNodeClick={handleClick}
            enableNodeDrag={false} />
    );
}