class node {
  constructor() {
     this.id = graph.utils.getNextID()
     this.neighbors = []
     this.degree = _ => this.neighbors.length
     this.averageNeighbor = function() {
        var sum = 0; 

        if (this.neighbors.length == 0) return 0; 

        this.neighbors.forEach(neighbor => { sum += graph.getNode(neighbor).degree()})
            
        return sum / this.degree()
     }
     this.draw = function(data) {
         // create node container object
         var node = $('<div draggable="true"></div>')
            .addClass('node')
            .attr('id', this.id)
            .css('top', data.x)
            .css('left', data.y);

         // append node SVG
         node.append($.parseHTML(newNodeSVG(this.id, this.id)))

         if (graph.settings.showStats)
            node.append(graph.getStatsRepresentation(this, true))

         // append to graph container
         $(node).hide().fadeIn('fast').appendTo(graph.container)
     }
  }
}

function newNodeSVG(label, id) {
  return `<svg width="40" id="n_${id}" height="40" xmlns="http://www.w3.org/2000/svg">
         <g>
          <ellipse fill="#82204A" cx="20" cy="20" rx="15" ry="15"/>
          <text xml:space="preserve" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="14" id="svg_2"
            y="25" x="20" stroke-opacity="null" stroke-width="0" stroke="#ffffff" fill="#ffffff">${label}</text>
         </g>
        </svg>`
}