// global variables:
// graph = global graph, defined in

var debug = true

$(function() {

var draggedNode; // object dragged

// event listeners
$(graph.container).mousedown(onMouseDown)
$(graph.container).mouseup(onMouseUp)
$(graph.container).on('dblclick', '.node svg', removeNode)
$(graph.container).on('dblclick', '[id^="edge-line-"]', onEdgeClick)

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

    if (isEdge)
        return;

    // user clicked a node
    if (nodeClicked && draggedNode) {
        var nodeDownID = draggedNode.attr('id')
        var nodeUpID = nodeUp.attr('id')

        if (nodeDownID == nodeUpID) // user clicked a node
//            moveNode(nodeUpID)
            return;
        else // user dragged a node - create edge
            createUndirectedEdge(nodeDownID, nodeUpID)
    } else // user clicked empty space - add a node
        addNode(evt);

    draggedNode = null;
}

// adds a node to the global graph object
// and draws it to the screen
function addNode(evt) {
    var data = {
        x : evt.clientY - 10,
        y : evt.clientX - 20
    }

    var m = graph.addNode()
    m.draw(data)
    writeIfDebug(`adding a node: ${m.id}`)
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
    // remove node from dom
    node.fadeOut('fast')
    // on screen, remove connecting edges
    $(`[class*='edge_${id}']`).fadeOut('fast')
    $(`[class ^=edge][class $=${id}]`).fadeOut('fast')

    // remove node from graph
    graph.removeNodeByID(id)

    writeIfDebug(`Removed node ${id}`)
}

function onEdgeClick(evt) {
    // don't add a node
    evt.stopPropagation()
    // remove edge on screen
    $(evt.target).fadeOut('fast')

    // id is in form edge-line-1-2
    var arr = $(evt.target).attr('id').split("-")

    if (arr.length < 4) {
        console.error(`Invalid edge: ${arr}`)
        return
    }

    var startNodeID = arr[2]
    var endNodeID = arr[3]
    graph.removeEdge(startNodeID, endNodeID)
}

function moveNode(nodeID) {
    console.log("moving node " + nodeID + "...")

    var element = '.node#' + nodeID;

    $(document).off('mousedown'); // remove regular click event listener
    $(document).off('mouseup');

    $(document).on('mousemove', function(e) {
       // todo: wrap in closure
       $(element).css({
           left:  e.pageX,
           top:   e.pageY
        })
    })

    // when user clicks, remove event listener and restore old one
    $(document).on('mousedown', function(e) {
        $(document).off('mousemove')
        $(document).on('mousedown', onMouseDown)
        $(document).on('mousedup', onMouseUp)
    })

}

function createUndirectedEdge(nodeID1, nodeID2) {
    graph.createUndirectedEdge(nodeID1, nodeID2)

    node1 = $(`.node#${nodeID1}`)
    node2 = $(`.node#${nodeID2}`)

    info1 = {
        position: node1.position(),
        width: node1.width(),
        height: node1.height()
    }

    info2 = {
        position: node2.position(),
        width: node2.width(),
        height: node2.height()
    }

    var center1X = info1.position.left + info1.width / 2; // node 1, X
    var center2X = info2.position.left + info2.width / 2; // node 2, X
    var center1Y = info1.position.top + info1.height / 2; // node 1, Y
    var center2Y = info2.position.top + info2.height / 2; // node 2, Y

    // line starts at 0, 0
    var x2 = center2X - center1X
    var y2 = center2Y - center1Y

//    console.log(info1, info2, x2, y2)

    drawLine(nodeID1,
             nodeID2,
             Math.abs(center1X - center2X),
             Math.abs(center2Y - center1Y),
             center1X,
             center1Y,
             x2, y2
    );
}

function drawLine(node1ID, nodeID2, width, height, startX, startY, x2, y2) {
    if (!node1ID || startY == undefined || startX == undefined || x2 == undefined || y2 == undefined) {
        console.error(`Cannot draw line, invalid parameters: ${node1ID} ${x1} ${x2} ${y1} ${y2}`)
        return
    }

//    console.log(`start at (${startX}, ${startY})`)
//    console.log(`end at (${x2}, ${y2})`)

    var div = $("<div></div>")
        .attr('class', 'edge_' + node1ID + "_" + nodeID2)
        .css('position', 'absolute')
        .css('top', startY)
        .css('left', startX);

    var svg = $.parseHTML(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
                    <line id="edge-line-${node1ID}-${nodeID2}" x1="0" y1="0" x2="${x2}" y2="${y2}" stroke="#231123" stroke-width="5"></line>
          </svg>`
      )

    div.append(svg)
    $(div).hide().appendTo(graph.container).fadeIn('fast');
};
})