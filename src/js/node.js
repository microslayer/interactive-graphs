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
     this.getStatValues = function(stats) {
        var n = this; 
        var statsObj = {}; 

        Object.entries(stats).forEach(([key, fn]) => {
            var value = fn(n); 
            if (!isNaN(value))
                value = value.toFixed(2).replace(/[.,]00$/, "");
            statsObj[key] = value; 
        });

        return statsObj; 
     }, 
     this.getStatValuesHtml = function(stats, wrapper) {
        var statObj = this.getStatValues(stats); 
        var statStr = "";

        Object.entries(statObj).forEach(([key, value]) => {
            statStr += `<span class='${key}'>${key}: <num>${value}</num></span><br />`; 
        });

        if (wrapper) 
            statStr = `<p class="nodeinfo">` + statStr + `</p>`;

        return statStr; 
     }, 
     this.draw = function(data) {
         // create node container object
         var n = $('<div draggable="true"></div>')
            .addClass('node')
            .attr('id', this.id)
            .css('top', data.x)
            .css('left', data.y);

         // append node SVG
         n.append($.parseHTML(newNodeSVG(this.id, this.id)))

         if (graph.settings.showNodeStats) {
            var statStr = this.getStatValuesHtml(graph.nodeStats, true); 
            n.append(statStr); 
         }

         // append to graph container
         $(n).hide().fadeIn('fast').appendTo(graph.container)
            .css('top', data.x)
            .css('left', data.y);
     }
  }
}

function newNodeSVG(label, id) {
  return `<svg width="30" id="n_${id}" height="30" xmlns="http://www.w3.org/2000/svg">
         <g>
          <ellipse fill="#82204A" cx="15" cy="15" rx="15" ry="15"/>
          <text xml:space="preserve" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="14" id="svg_2"
            y="20" x="15" stroke-opacity="null" stroke-width="0" stroke="#ffffff" fill="#ffffff">${label}</text>
         </g>
        </svg>`
}