class Graph {
  constructor(container) {
     this.nodes = []
     this.container = container
     this.settings = {
        showNodeStats : false, 
        showGraphStats : true
     }
     this.nodeStats = {
        'degree' : function(node) { 
             return node.degree()
        }, 
        'fiVector' : function(node) { 
            var degree = node.degree()

            if (degree == 0) return 0; 

            var neighbors_degree = []
            node.neighbors.forEach(neighbor => { 
                neighbors_degree.push(graph.getNode(neighbor).degree()) 
            }); 

            return (neighbors_degree.reduce((a, b) => a + b, 0) / neighbors_degree.length) / degree; 
        }
     }, 
     this.graphStats = {
        'degree' : function(graph) { 
             return graph.nodes.length; 
        }
     }, 
     // if `htmlRepresentation` is not specified, an object is returned
     // otherwise an HTML representation of the stats 
     this.getNodeStatsRepresentation = function(node, htmlRepresentation) {
        var stats = this.nodeStats;
        var statStr = "";

        Object.entries(stats).forEach(([key, fn]) => {
            var value = fn(node).toFixed(2).replace(/[.,]00$/, "");
            if (htmlRepresentation)
                statStr += `<span class='${key}'>${key}: <num>${value}</num></span><br />`; 
            else 
                stats[key] = value; 
        });

        if (htmlRepresentation)
            var statStr = `<p class="nodeinfo">` + statStr + `</p>`;

        return (htmlRepresentation ? statStr : stats); 
     }, 
     this.utils = {
        currentNodeID : 65, // A
        getNextID : function() {
            if (this.currentNodeID == 91) // if 'Z' go to 'a'
                this.currentNodeID = 97;
            else if (this.currentNodeID == 123) // if 'z' go to 'א'
                this.currentNodeID = 1488;
            else if (this.currentNodeID >= 1515) { // if 'ת' start counting from numbers
                this.currentNodeID++;
                return (this.currentNodeID-1515);
            }
            return String.fromCharCode(this.currentNodeID++)
        }, 
     }

     this.size = _ => this.nodes.length;

     this.getNode = id => {
        return this.nodes.filter(a => a.id == id)[0]
     }

     this.addNode = _ => {
        var n = new node()
        this.nodes.push(n)
        writeIfDebug(`Added node ${n.id}`)
        return n // return object to allow for object chaining
     }

     this.removeNodeByID = id => {
        var index = this.nodes.findIndex(a => a.id == id)
        var neighbors = this.nodes[index].neighbors.slice()

        if (index == -1) {
            console.error("Node ID not found")
            return
        }

        this.nodes.splice(index, 1)

        // remove connections involving this node
        for (var i = 0; i < neighbors.length; i++) {
            var neighborNode = this.nodes.filter(a => a.id == neighbors[i])[0]
            remove(neighborNode.neighbors, id)
        }

        writeIfDebug(`Removed node ${id}`)

        return true
     }

     this.reset = _ => {
        this.nodes = []
        this.utils.currentNodeID = 65
     }

     this.removeEdge = (startID, endID) => {
        var node1i = this.nodes.filter(a => a.id == startID)[0]
        var node2i = this.nodes.filter(a => a.id == endID)[0]

        remove(node1i.neighbors, endID)
        remove(node2i.neighbors, startID)

        writeIfDebug(`Removed edge between ${startID} and ${endID}`)

        return true
     }

     this.createUndirectedEdge = (nodeID1, nodeID2) => {
        if (nodeID1 == nodeID2) 
            throw `Cannot add self-loop`

        var node1index = this.nodes.findIndex(a => a.id == nodeID1)
        var node2index = this.nodes.findIndex(a => a.id == nodeID2)

        if (this.nodes[node1index].neighbors.indexOf(nodeID2) != -1) 
            throw `Node ${nodeID1} is already connected to node ${nodeID2}`

        if (this.nodes[node2index].neighbors.indexOf(nodeID1) != -1) 
            throw `Node ${nodeID2} is already connected to node ${nodeID1}`

        this.nodes[node1index].neighbors.push(nodeID2)
        this.nodes[node2index].neighbors.push(nodeID1)

        writeIfDebug("created edge between " + nodeID1 + " and " + nodeID2)

        return true
     }

  }
}