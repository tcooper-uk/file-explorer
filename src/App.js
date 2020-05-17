import React, {useState, useEffect, useRef} from 'react';
import {Treebeard} from 'react-treebeard';
import Titlebar from 'react-electron-titlebar';

import TreeGraph from './component/TreeGraph.js';
import ForceGraph from './component/ForceGraph.js';
import FolderSelect from './component/FolderSelect.js';

import './App.css';

function App() {

  const [hierachy, setHierachy] = useState({ name: "root"});
  const [clusters, setClusters] = useState([]);
  const [errors, setErrors] = useState([]);
  const [path, setPath] = useState('');
  const [cursor, setCursor] = useState(false);
  const [treeStyle, setTreeStyle] = useState("tab selected");
  const [graphStyle, setGraphStyle] = useState("tab");
  const [treeActive, setTreeActive] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  
  const treeRef = useRef(null);

  const treeBtnId = "treeBtn";
  const graphBtnId = "graphBtn"

  // load state
  useEffect(() => {

    let folderPath = window.localStorage.getItem('folder-path');

    if(folderPath){

      window.ipcRenderer.send('event-request-data', folderPath);
      window.ipcRenderer.on('event-data', function(event, res) {
        setErrors([]);

        if(res.clusters)
          setClusters(res.clusters)

        setHierachy(res.data);
      });

    }

      // listen for errors from server
      window.ipcRenderer.on('event-bad-data', function(event, errors) {

        setErrors(errors.map((e) => {
            return (
              <>
                <p className='err-message'>Error: {e.message} for {e.path}</p>
                <br/>
              </>
            )
        }));
      });

  }, [path]); 

  function getClusterHtml(clusters) {

    let temp = [];
    if(clusters.length > 0){

      for(const [index, value] of clusters.entries()) {
        temp.push(<li key={index}><span className="dot" style={{backgroundColor: value.color}}/>Cluster {value.id}: {value.score}%</li>)
      }

    }
    return temp
  }

  const onToggle = (node, toggled) => {
    console.log(node);

    setSelectedNode((
      <>
        <li>Name: {node.name}</li>
        {
          node.attributes.size ?
          <li>Size: {node.attributes.size}</li> :
          null
        }
      </>
    ));


    if (cursor) {
        cursor.active = false;
    }
    node.active = true;
    if (node.children) {
        node.toggled = toggled;
    }
    setCursor(node);
  }

  const onTabClick = (event) => {

    if(event.currentTarget.id === graphBtnId && treeActive) {
      setTreeStyle("tab");
      setGraphStyle("tab selected");
      setTreeActive(false);
    }


    if(event.currentTarget.id === treeBtnId && !treeActive) {
      setTreeStyle("tab selected");
      setGraphStyle("tab");
      setTreeActive(true);
    }
  }


  return (
    <>
      <div className="title-bar">
        <Titlebar title="Files" backgroundColor="#000000"></Titlebar>
      </div>
      <div className="top">
        <FolderSelect hasErrors={errors.length > 0} onChange={e => setPath(e)} />
        {
          errors.length > 0 ? null :
          <ul className="cluster-list">
            {getClusterHtml(clusters)}
          </ul>
        }  
      </div>

      <main>
        <aside>
          <div className="node-content">
            <ol>
              {selectedNode}
            </ol>
          </div>
          <Treebeard 
            data={hierachy}
            onToggle={onToggle} />
        </aside>

        <section>

          <nav>
            <button id={graphBtnId} className={graphStyle} onClick={onTabClick} >Cluster</button>
            <button id={treeBtnId} className={treeStyle} onClick={onTabClick} >Tree (Slower)</button>
          </nav>

          <div ref={treeRef} className="tree-container">
            {
              treeActive ? 
                <TreeGraph data={hierachy} parentRef={treeRef} errors={errors} /> :
                <ForceGraph data={hierachy} clusters={clusters} />
            }
          </div>
          
        </section>
      </main>

    </>
  );
}


export default App;