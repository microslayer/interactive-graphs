/* Global variables:

   - graph      : global graph, defined in ../index.html
   - statsPanel : represents the stats panel, defined in stats_panel.js
*/ 

var debug = true

$(function() {

/* 
    Event Listeners
*/

$(graph.container).mousedown(onMouseDown)
$(graph.container).mouseup(onMouseUp)
$(graph.container).on('dblclick', '.node svg', removeNode)
$(graph.container).on('dblclick', '[id^="edge-line-"]', onEdgeClick)

/* 
    Event Listeners - Node Dragging
*/

$(graph.container).on('dragstart', '.node', onNodeDrag)
$(graph.container).on('drop', '.node', onNodeDrop)
$(graph.container).on('dragover', '.node', evt => event.preventDefault() )
$(graph.container).on('drop', onNodeDrop)

/* 
    Stats Panel
*/

var statsPanel = new StatsPanel(graph)

/* 
    Set up the node and graph statistics panel 
*/

$(document).on("nodeAdd nodeRemove edgeAdd edgeRemove graphChange", statsPanel.graphStatsPanel.update)
$(document).on("nodeStatAdd nodeStatChange nodeStatRemove", e => statsPanel.nodeStatsPanel.updatePanel)
$(document).on("nodeStatAdd nodeStatChange nodeStatRemove", e => statsPanel.nodeStatsPanel.update)

/* 
    Button Event Listeners 
*/ 

$("button#reset").click(reset)
$("button#showNodeStats").click(statsPanel.nodeStatsPanel.toggleDisplay)
$("button#showStatsPanel").click(e => statsPanel.toggleDisplay()); 
$("button#printJson").click(printJson)

/*
    Set up controls modal 
*/ 

var controls_modal = new g_modal(
    null, // no id needed
    'Controls', 
    `<p>Click to add a node</p>
    <p>Double click to remove a node</p>
    <p>Click and drag a node to move it</p>
    <p>Click and drag a node on top of a node to add an edge</p>
    <p>Double click an edge to remove it</p>`); 
$('body').append(controls_modal.wrapper)
$("button#showControls").click(_ => controls_modal.showModal()); 

/* 
    Functions 
*/ 
function printJson() {
    console.log(JSON.stringify(graph.nodes))
}

function onNodeDrag(evt) {
    evt.originalEvent.dataTransfer.setData("sourceID", event.target.id);
}

function onNodeDrop(evt) {
    evt.preventDefault();
    evt.stopPropagation();

    var sourceID = evt.originalEvent.dataTransfer.getData("sourceID");
    var targetNode = getNodeFromChild(evt.target);

    if (isNode(targetNode)) { // create edge
        var targetID = targetNode.attr('id')
        createUndirectedEdge(sourceID, targetID)
    } else { // move node
        var sourceNode = getNodeElmFromID(sourceID);
        var height = sourceNode.find("svg").height();
        var offset = $(graph.container).offset(); 
        sourceNode.css({
            "left" : evt.pageX - offset.left - (height / 2), 
            "top" : evt.pageY - offset.top - (height / 2)
        }); 
        for (neighbor of graph.getNode(sourceID).neighbors) {
            redrawLine(sourceID, neighbor)
        }
    }
}

function reset() {
    graph.reset()
    $(graph.container).fadeOut('fast', function() { $(graph.container).empty().show() })
    statsPanel.graphStatsPanel.initStatsAndUpdateUI()

    var event = new CustomEvent('graphChange', { bubbles: true });
    document.dispatchEvent(event);
}

function onMouseDown(evt) {
    // if mouse down on node, trying to create connection between two nodes
    var nodeDown = $(evt.target).parents(".node");

    if (nodeDown.length > 0) {
        draggedNode = nodeDown
    }
}

function onMouseUp(evt) {
    var nodeUp = $(evt.target).parents(".node");
    var nodeClicked = nodeUp.length > 0;
    var isEdge = $(evt.target).is('[id^="edge-line-"]')

    if (isEdge) // separate event will fire and create an edge
        return;
    else if (nodeClicked) // don't want to create a node on top of node
        return;
    else
        n = addNode(evt);
}

// adds a node to the global graph object
// and draws it to the screen
function addNode(evt) {
    var graphDrawingPanel = $(graph.container); 
    var offset = graphDrawingPanel.offset(); 

    var data = {
        x : evt.pageY - 10 - offset.top,
        y : evt.pageX - 20 - offset.left
    }

    var m = graph.addNode()
    m.draw(data)

    // trigger event 
    var event = new CustomEvent('nodeAdd', { bubbles: true, id : m.id });
    document.dispatchEvent(event);
}

// removes a node from the global graph object
// and the screen
function removeNode(evt) {
    var node = $(evt.target).parents(".node")

    if (node.length == 0) {
        console.error("No node to remove")
        return;
    }

    var id = node.attr('id')
    var neighbors = graph.getNode(id).neighbors.slice()

    // remove node from dom
    node.fadeOut('fast', function(n) { node.remove() })

    // on screen, remove connecting edges
    $(`[class*='edge_${id}']`).fadeOut('fast', function() { $(`[class*='edge_${id}']`).remove() })
    $(`[class ^=edge][class $=${id}]`).fadeOut('fast', function(n) { $(`[class ^=edge][class $=${id}]`).remove() })

    // remove node from graph
    graph.removeNodeByID(id)

    // update degree
    if (graph.settings.showNodeStats)
        for (neighbor of neighbors)
            statsPanel.nodeStatsPanel.update(neighbor)

    // trigger event 
    var event = new CustomEvent('nodeRemove', { bubbles: true, id : id });
    document.dispatchEvent(event);
}

function onEdgeClick(evt) {
    // don't add a node
    evt.stopPropagation()

    // id is in form edge-line-1-2
    var arr = $(evt.target).attr('id').split("-")

    if (arr.length < 4) {
        console.error(`Invalid edge: ${arr}`)
        return
    }

    var startNodeID = arr[2]
    var endNodeID = arr[3]

    if (graph.removeEdge(startNodeID, endNodeID)) {
        // remove edge on screen
        removeEdgeVisual(startNodeID, endNodeID); 

        // trigger event 
        var event = new CustomEvent('edgeRemove', { 
            bubbles: true,
            fromNode : startNodeID, 
            toNode : endNodeID
        });
        document.dispatchEvent(event);
    } else {
        console.error(`Error removing edge ${startNodeID}-${endNodeID}`)
    }
}

function createUndirectedEdge(nodeID1, nodeID2) {
    if (nodeID1 == nodeID2)
        return;

    try {
        graph.createUndirectedEdge(nodeID1, nodeID2); 
        renderLine(nodeID1, nodeID2);

        if (graph.settings.showNodeStats) {
            nodes = [nodeID1, nodeID2]

            nodes.forEach(n => {
                statsPanel.nodeStatsPanel.update(n); 
                for (nb of graph.getNode(nodeID1).neighbors)
                    statsPanel.nodeStatsPanel.update(nb); 
            })
        }
    } catch (e) {
        console.error(`Error creating undirected edge ${nodeID1}, ${nodeID2}: ${e}`)
    }

    // trigger event 
    var event = new CustomEvent('edgeAdd', { bubbles: true, fromNode : nodeID1, toNode : nodeID2 });
    document.dispatchEvent(event);
}

function redrawLine(nodeID1, nodeID2) {
    removeEdgeVisual(nodeID1, nodeID2);
    renderLine(nodeID1, nodeID2);
}

function removeEdgeVisual(nodeID1, nodeID2) {
    var classNameEdge1 = `edge_${nodeID1}_${nodeID2}`; 
    var classNameEdge2 = `edge_${nodeID2}_${nodeID1}`; 

    var edge1 = $("." + classNameEdge1).filter((index, elm) => $(elm).hasClass(classNameEdge1));  
    var edge2 = $("." + classNameEdge2).filter((index, elm) => $(elm).hasClass(classNameEdge2)); 

    $(edge1).remove()
    $(edge2).remove()

    if (graph.settings.showNodeStats) {
        nodes = [nodeID1, nodeID2]

        nodes.forEach(n => {
            statsPanel.nodeStatsPanel.update(n); 
            for (nb of graph.getNode(nodeID1).neighbors)
                statsPanel.nodeStatsPanel.update(nb); 
        })
    }

}

function renderLine(nodeID1, nodeID2) {
    var node1 = getNodeElmFromID(nodeID1);
    var node2 = getNodeElmFromID(nodeID2);

    info1 = {
        position: node1.position(),
        width:    node1.find('svg').width(), 
        height:   node1.find('svg').height()
    }

    info2 = {
        position: node2.position(),
        width:    node2.find('svg').width(), 
        height:   node2.find('svg').height()
    }

    var x1 = info1.position.left + info1.width / 2; // node 1, X
    var x2 = info2.position.left + info2.width / 2; // node 2, X
    var y1 = info1.position.top + info1.height / 2; // node 1, Y
    var y2 = info2.position.top + info2.height / 2; // node 2, Y

    if (x2 == x1) { // straight vertical line 
        startX = x1; 
        startY = Math.min(y1, y2);  
        minX = 0, minY = 0, maxX = 0; 
        maxY = Math.max(y1, y2);
    } else if (y2 == y1) { // straight horizontal line 
        startX = Math.min(x1, x2); 
        startY = y1;  
        minX = 0, minY = 0, maxY = 0;  
        maxX = Math.max(x1, x2); 
    } else if (x2 > x1 && y2 > y1) { // Diagonal, top-left to bottom-right
        startX = x1;
        startY = y1;
        minX = 0, minY = 0;
        maxX = x2 - x1;
        maxY = y2 - y1;
    } else if (x2 < x1 && y2 < y1) {
        startX = x2;
        startY = y2;
        minX = 0, minY = 0;
        maxX = x1 - x2;
        maxY = y1 - y2;
    } else if (x2 < x1 && y2 > y1) {
        startX = x2;
        startY = y1;
        minX = 0, maxY = 0; 
        minY = y2 - y1;
        maxX = x1 - x2;
    } else { 
        startX = x1;
        startY = y2;
        minX = 0, maxY = 0;
        minY = y1 - y2;
        maxX = x2 - x1;
    }

    drawLine(nodeID1,
             nodeID2,
             Math.abs(x2 - x1),
             Math.abs(y2 - y1),
             minX, maxX, minY, maxY,
             startX, startY
    );
}

function drawLine(node1ID, nodeID2, width, height, minX, maxX, minY, maxY, startX, startY) {
    var strokeWidth = 2; 

    if (width < 3) { /* straight vertical line */ strokeWidth = 4-width; width = 5; }
    if (height < 3) { /* straight horizontal line */ strokeWidth = 4-height; height = 5; }

    var div = $("<div></div>")
        .attr('class', 'edge_' + node1ID + "_" + nodeID2)
        .css('position', 'absolute')
        .css('z-index', '-5')
        .css('top', startY)
        .css('left', startX);

    var svg = $.parseHTML(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" shape-rendering="geometricPrecision">
                    <line id="edge-line-${node1ID}-${nodeID2}" x1="${minX}" y1="${minY}" x2="${maxX}" y2="${maxY}"
                    stroke="#E8C547" stroke-width="${strokeWidth}"></line>
          </svg>`
      )

    div.append(svg)
    $(div).hide().appendTo(graph.container).fadeIn('fast');
};
})