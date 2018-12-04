class Graph {
  constructor(container) {
     this.nodes = []
     this.container = container
     this.settings = {
        showNodeStats : true, 
        showGraphStats : true
     }
     this.nodeStats = {
        'degree' : {
            fn: function(node) { 
             return node.degree()
            }, 
            visible: true
        }, 
        'fiVector' : {
            visible: true, 
            fn: function(node) { 
                var degree = node.degree()
                if (degree == 0) return 0; 
                var neighbors_degree = []
                node.neighbors.forEach(neighbor => { 
                    neighbors_degree.push(graph.getNode(neighbor).degree()) 
                }); 
                return (neighbors_degree.reduce((a, b) => a + b, 0) / neighbors_degree.length) / degree; 
            }, 
        }, 
        'neighborLen' : {
            visible: true, 
            fn: function(node) { 
                return node.neighbors.length;
            }, 
        }
     }, 
     this.graphStats = {
        'degree' : { 
            visible: true, 
            fn: function(graph) { 
             return graph.nodes.length; 
            }
        }, 
        'degreeDiv3' : { 
            visible: true, 
            fn: function(graph) { 
             return graph.nodes.length / 3; 
            }
        }, 
        'firstNeighbor' : { 
            visible: true, 
            fn: function(graph) { 
             return graph.nodes[0].id; 
            }
        }
     }, 
     this.utils = {
        currentNodeID : 1, 
        getNextID : function() {
            return this.currentNodeID++; 
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
        this.utils.currentNodeID = 1
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

     this.getStatValues = _ => {
        var n = this; 
        var stats = this.graphStats; 
        var statsObj = {}; 

        Object.entries(stats).forEach(([key, stat]) => {
            var entry = { value: null, visible: stat.visible };   
            if (!stat.visible) // don't compute stat if it's not visible 
                entry.value = ""; 
            else {
                try {
                    entry.value = stat.fn(n)
                } catch (e) {
                    entry.value = "Error: " + (e ? JSON.stringify(e) : "");  
                }
                if (!isNaN(entry.value))
                    entry.value = entry.value.toFixed(2).replace(/[.,]00$/, "");
            }
            statsObj[key] = entry; 
        });

        return statsObj; 
     }

     this.getStatValuesHtml = (wrapper) => {
        var statObj = this.getStatValues(stats); 
        var statStr = "";

        Object.entries(statObj).forEach(([key, val]) => {
            statStr += getListItemHtml(key, val.value, {colon:true, visible: val.visible }); 
        });

        if (wrapper) 
            statStr = `<ul>${statStr}</ul>`;

        return statStr; 
     }

  }
}