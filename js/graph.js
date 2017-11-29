class Graph {
  constructor(container) {
     this.nodes = []
     this.container = container
     this.utils = {
        currentNodeID : 65, // A
        getNextID : function() { return String.fromCharCode(this.currentNodeID++) }
     }

     this.size = _ => this.nodes.length;

     this.addNode = _ => {
        var n = new node()
        this.nodes.push(n)
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
     }

     this.removeEdge = (startID, endID) => {
        var node1i = this.nodes.filter(a => a.id == startID)[0]
        var node2i = this.nodes.filter(a => a.id == endID)[0]

        remove(node1i.neighbors, endID)
        remove(node2i.neighbors, startID)

        writeIfDebug(`Removed edge between ${startID} and ${endID}`)
     }

     this.createUndirectedEdge = (nodeID1, nodeID2) => {
        var node1index = this.nodes.findIndex(a => a.id == nodeID1)
        var node2index = this.nodes.findIndex(a => a.id == nodeID2)

        if (this.nodes[node1index].neighbors.indexOf(nodeID2) != -1) {
            console.error(`Node ${nodeID1} is already connected to node ${nodeID2}`)
            return
        }

        if (this.nodes[node2index].neighbors.indexOf(nodeID1) != -1) {
            console.error(`Node ${nodeID2} is already connected to node ${nodeID1}`)
            return
        }

        this.nodes[node1index].neighbors.push(nodeID2)
        this.nodes[node2index].neighbors.push(nodeID1)

        writeIfDebug("created edge between " + nodeID1 + " and " + nodeID2)

     }

  }
}