/*
* Scoring of containers in the hierachy.
* The purpose of this module is to traverse the hierachy
* and aggregate the container scores for direct child containers.
*/

let colors = [
  '#fe868e',
  '#224daa',
  '#b08f4d',
  '#542f23',
  '#8bdf95',
  '#cf3f3d',
  '#ff4040',
  '#006400',
  '#f8ef76',
  '#e851f2'];

let groupCounter = 0;
let colorCounter= 0;

function calculateHierachyScore({node, isRoot, parent, clusters}){

    if(node.type !== "folder") return;

    if(isRoot) {
      groupCounter = 0;
      colorCounter = 0;
    }
  
    var scores = [];
    var groupNode = {
      current: node,
      children: []
    };
  
    node.children.forEach(function(value){

      if(value.type === "folder"){
  
        // get score
        if(value.score !== 0)
          scores.push(1.0 - (value.score / 100));
    
        // next
        calculateHierachyScore({node: value, isRoot: false, parent: groupNode, clusters});
      }
    });


    if(scores.length > 0) {
      // this container has a hieracy score

      var hScore = __aggregateScores(scores);
  
      hScore = hScore % 1 === 0 ? Math.round(hScore) : hScore;
      node.hScore = hScore;
      node.attributes.HierachyScore = `${hScore}%`;

      // add to group
      parent.children.push(groupNode);

      // we should not include the root in the cluster
      // we should make clusters out of the direct children of the root if required
      if(isRoot && groupNode.children.length > 0) {
        __createClusters(groupNode, clusters);
      }

    }
    else {
      // this container does not have a hierachy score
      // check we have more than one node in the group
      if(groupNode.children.length > 0){
        
        // set node color for group
        __createClusters(groupNode, clusters);
      }
    }

    return groupNode;
  }

  function __createClusters(node, clusters) {

    node.children.forEach(function(container){

      // we can only create a cluster of > 1
      if(container.children.length > 0){

        let scores = []

        if(colorCounter == colors.length) colorCounter = 0;
        let color = colors[colorCounter++]; 
        __createSingleCluster(++groupCounter, container, color, scores); 

        let clusterScore = __aggregateScores(scores);

        clusters.push({
          id: groupCounter,
          score: clusterScore,
          color: color
        });

      }
      
    });
  }

  function __createSingleCluster(groupId, node, color, scores = []) {

    node.current.nodeSvgShape.shapeProps.fill = color;
    node.current.attributes.Cluster = groupId;

    scores.push(1.0 - (node.current.hScore / 100));

    node.children.forEach(function(childNode){
      __createSingleCluster(groupId, childNode, color, scores);
    });

  }
  
  // container score aggregation funtion
  function __aggregateScores(scores){
    const reducer = (accumulator, currentValue) => accumulator * currentValue;
    const score = scores.reduce(reducer);
    var agg =  (1.0 - score) * 100;
    return agg.toFixed(1);
  }

  module.exports.calculateHierachyScore = calculateHierachyScore;