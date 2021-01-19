let lookupTable = {}; //lookup the new table.
let reverseLookup = {}; // map ID to artForm name
let adjacentMatrix = {};// to find nodes related to and from this nodes
let lookupTable2 = {};
let byMatrix = {};
let network;


// create an array with nodes
function drawGraph(nodes, edgesData) {
//sdfsfsdf
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
    interaction:{
      hover: true,
    },

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
            gravitationalConstant: -9000,
            centralGravity: 0.3,
            springLength: 160,
            springConstant: 0.01,
            damping: 0.09,
            avoidOverlap: 0.75
          },

    }
  };
  network = new vis.Network(container, data, options)
  //#### get nodes that was clicked, create the box for node info and the bullet points for the related artforms.
   network.on("selectNode", function (params) {
    let divElement = document.createElement('div');
    let commonSenses = document.createElement('div');
    let relatedTo = document.createElement('div');
    let unorderedList = document.createElement('ul');
    let relatedBy = document.createElement('div');
    let nodeId = params.nodes[0];
  //#### take the node id from click, reverse lookup for the name, and then HTML write onto a html <div> using `(the one beside ~) and the ${} means javascript
    divElement.innerHTML = `<div>
      <h1 style="color:white; text-align: center;">${reverseLookup[nodeId]}</h1>
    </div>
    `;
    commonSenses.innerHTML = `<div>
      <h4 style="color:white;">Common Senses: </h4>
    </div>
    `;
    //#### to add a "related to" text into the information box
    relatedTo.innerHTML = `<div>
      <h4 style="color:white;">Related To: </h4>
    </div>
    `;
    relatedBy.innerHTML = `<div>
      <h4 style="color:white;">Related By: </h4>
    </div>
    `;
  //#### pass the adjacent into the "#output" column at the information box on the right
    let adjacents = adjacentMatrix[nodeId];
    let output = "";
    if (Array.isArray(adjacents)) {
      for (let a of adjacents) {
      // console.log(reverseLookup[a]);
      // output += reverseLookup[a] + "1\n";
      unorderedList.innerHTML += "<li>" + reverseLookup[a] + "</li>"
    } 
    
    // clear everything inside the #output div
    document.querySelector("#output").innerHTML = "";
    document.querySelector("#output").appendChild(divElement);
    document.querySelector("#output").appendChild(commonSenses);
    document.querySelector("#output").appendChild(relatedTo);
    document.querySelector("#output").appendChild(unorderedList);
    document.querySelector("#output").appendChild(relatedBy);
    } else {
      console.error("Unable to gt adacjents for nodeId = " + nodeId)
    }
    
        
  });


}

var changeChosenNodeSize = function (values, id, selected, hovering) {
  values.size = 60;
};
var changeChosenLabelSize = function (values, id, selected, hovering) {
  values.size +=1.5;
};

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
        group:artform.Primary_Sense,
        chosen: { label: changeChosenLabelSize, node: changeChosenNodeSize },
      }
    })
// ### lookupTable = retrive the information from this node array
    lookupTable = {};
    reverseLookup = {};
    lookupTable2 = {};
    for (let i = 0; i < nodeNamesArray.length; i++) {
      let node = nodeNamesArray[i];
      lookupTable[node.Artform.toLowerCase()] = i;
      reverseLookup[i] = node.Artform;
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

  //### create adjacents matrix.
for (let j of jsonObject)  {
    //#### id of the current node represented by the j, split, trim spaces, remove null and lowercase all
     let nodeId = lookupTable[j.Artform.toLowerCase()];  
     let relatedTo = j.Related_Artforms.split(",")
      .map(s => s.trim())
      .filter(s => s != "")
      .map(relatedTo => {
        return lookupTable[relatedTo.toLowerCase()] || -1;
      })
     // filter all the 0s
     let adjacents = [...relatedTo].filter(f => f != -1);
    adjacentMatrix[nodeId] = adjacents;

  } 
console.log(adjacentMatrix);

//################### TESTING HERE
for (let j of jsonObject)  {
    //#### id of the current node represented by the j, split, trim spaces, remove null and lowercase all
    let newRelatedBy =[];
     let nodeId = lookupTable[j.Artform.toLowerCase()];  

     let relatedTo = j.Related_Artforms.split(",") //remove all ,
      .map(s => s.trim()) //remove spaces
      .filter(s => s != "") // remove null
      .map(relatedTo => { //convert the artform name to ID
        let originNode = lookupTable[relatedTo.toLowerCase()]  ||0;
        let relatedBy = nodeId;
        
      //  return newRelatedBy;
       //nodeId2[relatedBy] = nodeId2[relatedBy].push(nodeId);
      })
      
      //console.log(relatedTo);
      

     // console.log(nodeId);
     // filter all the 0s
     let byAdjacents = [...relatedTo].filter(f => f != -1);
    byMatrix[nodeId] = byAdjacents;

  } 
//console.log(byMatrix);
  /*
//###create related by matrix
for (let r of jsonObject)  {
    //#### id of the current node represented by the j, split, trim spaces, remove null and lowercase all
     let nodeId = lookupTable[r.Artform.toLowerCase()];  
     let relatedBy = r.Related_Artforms.split(",")
      .map(s => s.trim())
      .filter(s => s != "")
      .map(relatedBy => {
        if (relatedBy.toLowerCase() == nodeId){
        return lookupTable[r.Artform.toLowerCase()] || -1;
        }
      })
     // filter all the 0s
     let byAdjacent = [...relatedBy].filter(f => f != -1);
    byMatrix[nodeId] = byAdjacent;
    console.log(byMatrix);
  }
*/

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

function convertSenses(){
    V = "Vision";
    H = "Hearing";
    To = "Touch";
    Ta = "Taste";
    S = "Smell";
    VH = "Vision, Hearing";
    VTo = "Vision,Touch";
    VTa = "Vision,Taste";
    VS = "Vision,Smell";
    HTo = "Hearing,Touch";
    HTa = "Hearing,Taste";
    HS = "Hearing,Smell";
    ToTa = "Touch,Taste";
    ToS = "Touch,Smell";
    TaS = "Taste,Smell";
    VHTo = "Vision,Hearing,Touch";
    VHTa = "Vision,Hearing,Taste";
    VHS = "Vision,Hearing,Smell";
    VToTa = "Vision,Touch,Taste";
    VToS = "Vision,Touch,Smell";
    VTaS = "Vision,Taste,Smell";
    HToTa = "Hearing,Touch, Taste";
    HToS = "Hearing,Touch,Smell";
    HTaS = "Hearing,Taste,Smell";
    ToTaS = "Touch,Taste,Smell";
    VHToTa = "Vision,Hearing,Touch,Taste";
    VHToS = "Vision,Hearing,Touch,Smell";
    VHTaS = "Vision,Hearing,Taste,Smell";
    VToTaS = "Vision,Touch,Taste,Smell";
    HToTaS = "Hearing,Touch,Taste,Smell";
    VHToTaS = "Vision,Hearing,Touch,Taste,Smell"; 
}

//#### search, look up the table after new Set(remove duplicate)
//#### assign all text to lower case, search, zoom in with animation to that node.
document.querySelector('#search-btn').addEventListener('click', ()=>{

 let nodeId = lookupTable[document.querySelector('#search-terms').value.toLowerCase()];
 network.focus(nodeId, {animation: true, scale:0.7});
 network.selectNodes([nodeId]);

})

method2();
