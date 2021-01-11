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
  var network = new vis.Network(container, data, options)
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
    let nodeNamesArray = getNodes(jsonObject);
    let nodes = nodeNamesArray.map((artform, index) => {
      return {
        id: index,
        label: artform
      
      }
    })
// ### lookupTable = retrive the information from this node array
    let lookupTable = {};
    for (let i = 0; i < nodeNamesArray.length; i++) {
      let nodeName = nodeNamesArray[i];
      lookupTable[nodeName] = i;
    }
 // ####DRAW THE EDGES = for each artform within jsonObject, take the "Related_Artforms" column, split it using commas and push it individually(...)into edges(edges.push)
    let edges = [];
  for (let artform of jsonObject) {
    let related = artform.Related_Artforms.split(",")
      .map(s => s.trim())
      .filter(s => s != "")
      .map(related => {
        return {
          "from": lookupTable[artform.Artform],
          "to": lookupTable[related]
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
  let artformArray = artforms.map(a => a.Artform);
  // Set will automatically discard repeated values
  return [...new Set(artformArray)]

}

function colorConvert(artforms) {

    let V = "#FF6560"; //10000 Vision
    H = "#42a5f5";  //01000 Hearing
    To = "#ffee58 "; //00100 Touch
    Ta = "#bdbdbd"; //00010 Taste
    S = "#b39ddb"; //00001 Smell 
    VH = "#ba68c8"; //11000 Vision, Hearing
    VTo = "#23E1A4"; //10100 Vision,Touch
    VTa = "#bf360c";//10010 Vision,Taste
    VS = "#bf360c"; //10001 Vision,Smell
    HTo = "#69f0ae "; // 01100 Hearing,Touch
    HTa = "#e6ee9c"; // 01010 Hearing,Taste
    HS = "#e6ee9c"; //01001 Hearing,Smell
    ToTa = "#7BB128"; //00110 Touch,Taste
    ToS = "#e6ee9c"; //00101 Touch,Smell
    TaS = "#e6ee9c"; //00011 Taste,Smell
    VHTo = "#1BE381"; //11100 Vision,Hearing,Touch
    VHTa = "#1E7EB6"; //11010 Vision,Hearing,Taste
    VHS = "#1E37B6"; //11001 Vision,Hearing,Smell
    VToTa = "#e6ee9c"; //10110 Vision,Touch,Taste
    VToS = "#e6ee9c"; //10101 Vision,Touch,Smell
    VTaS = "#e6ee9c"; //10011 Vision,Taste,Smell
    HToTa = "#e6ee9c";//01110 Hearing,Touch, Taste
    HToS = "#e6ee9c";//01011 Hearing,Touch,Smell
    HTaS = "#e6ee9c";//01011 Hearing,Taste,Smell
    ToTaS = "#e6ee9c";//00111 Touch,Taste,Smell 
    VHToTa = "#e6ee9c";//11110 Vision,Hearing,Touch,Taste
    VHToS = "#B6711E";//11101 Vision,Hearing,Touch,Smell
    VHTaS = "#00FFB0";//11011 Vision,Hearing,Taste,Smell
    VToTaS = "#0095FF";//10111 Vision,Touch,Taste,Smell
    HToTaS = "#FF00AD";//01111 Hearing,Touch,Taste,Smell 
    VHToTaS = "#FF9600";//11111 Vision,Hearing,Touch,Taste,Smell
}

method2();
