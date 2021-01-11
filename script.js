let lookupTable = {};
let network;


// create an array with nodes
function drawGraph(nodes, edgesData) {

  // create an array with edges
  var edges = new vis.DataSet([
    ...edgesData
  ]);

  // create a network
  var container = document.getElementById("mynetwork");
  var data = {
    nodes: nodes,
    edges: edges,
  };
  var options = {  
    edges:{
      smooth: { type: "continuous" } 
    },
    layout: {
      improvedLayout: false
    },
    nodes: {
            shape: "circle",
            scaling: {
              min: 10,
              max: 30,
            },
            font: {
              size: 12,
              face: "Tahoma",
            },
            widthConstraint: 65,
          },
    physics:{
          enabled: true,
          barnesHut: {
            theta: 0.1,
            gravitationalConstant: -8000,
            centralGravity: 0.5,
            springLength: 150,
            springConstant: 0.01,
            damping: 0.09,
            avoidOverlap: 0.5
          },

    }
  };
  network = new vis.Network(container, data, options)
}



async function method2() {
  let url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQEiiCJ_MQKk2BVzvTEyeo7LMN19CNuf1kpr5RGosDhL1zsvn54epmqSuXKtKQuMsi5p3t8pHx9B14p/pub?gid=340655955&single=true&output=csv';
  let response = await axios.get(url);

// ### use CSV from Spreadsheet and save the data as "jsonObject" after loaded (await)
// ### then pass this string of "jsonObject" into all of those below =>{ }
  csv().fromString(response.data).then((jsonObject) => {
    // for (let j of jsonObject) {
    //   console.log(j)
    // }

//### getNodes()(function) from "jsonObject" passed from CSV of spreadsheet
//### Map the id and label as "index" and "artform"
     // console.log(jsonObject);
    let nodeNamesArray = getNodes(jsonObject);
    let nodes = nodeNamesArray.map((artform, index) => {
      return {
        id: index,
        label: artform.Artform,        
        group:artform.Primary_Sense
      }
    })
// ### lookupTable = retrive the information from this node array
    lookupTable = {};
    for (let i = 0; i < nodeNamesArray.length; i++) {
      let node = nodeNamesArray[i];
      lookupTable[node.Artform.toLowerCase()] = i;
    }
 // ####DRAW THE EDGES = for each artform within jsonObject, take the "Related_Artforms" column, split it using commas and push it individually(...)into edges(edges.push)
    let edges = [];
  for (let artform of jsonObject) {
    let related = artform.Related_Artforms.split(",")
      .map(s => s.trim())
      .filter(s => s != "")
      .map(related => {
        return {
          "from": lookupTable[artform.Artform.toLowerCase()],
          "to": lookupTable[related.toLowerCase()]
        }
      })
    edges.push(...related);

  }
  console.log(edges);
  // only draw the graph wnen data has been processed
  drawGraph(nodes, edges);

})

}
//####### FUNCTION that uses Set() which remove repeated items in the "Artform" column.
function getNodes(artforms) {
let artformArray = artforms.map(a => { return {Artform: a.Artform, Primary_Sense: a.Primary_Sense }});
  // Set will automatically discard repeated values
  return [...new Set(artformArray)]


}

document.querySelector('#search-btn').addEventListener('click', ()=>{

 let nodeId = lookupTable[document.querySelector('#search-terms').value.toLowerCase()];
 network.focus(nodeId, {animation: true, scale:2});
 network.selectNodes([nodeId]);

})

method2();
