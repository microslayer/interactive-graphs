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

$("button#reset").click(reset)
$("button#showAvgDegree").click(showAvgDegree)
$("button#printJson").click(printJson)

function printJson() {
    console.log(JSON.stringify(graph.nodes))
}

function showAvgDegree() {
    $(".nodeinfo").remove()

    $.each($(".node"), function(n, obj) {
        var id = $(obj).attr('id')
        var degree = graph.getNode(id).neighbors.length
        $(obj).append('<p class="nodeinfo">Degree: ' + degree + '</p>')
    });

}

function reset() {
    graph.reset()
    $(graph.container).fadeOut('fast', function() { $(graph.container).empty().show() })
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

    if (isEdge)
        return;

    // user clicked a node
    if (nodeClicked && draggedNode) {
        var nodeDownID = draggedNode.attr('id')
        var nodeUpID = nodeUp.attr('id')

        if (nodeDownID == nodeUpID) // user clicked a node
             //moveNode(nodeUpID)
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
    node.fadeOut('fast', function(n) { node.remove() })
    // on screen, remove connecting edges
    $(`[class*='edge_${id}']`).fadeOut('fast', function() { $(`[class*='edge_${id}']`).remove() })
    $(`[class ^=edge][class $=${id}]`).fadeOut('fast', function(n) { $(`[class ^=edge][class $=${id}]`).remove() })

    // remove node from graph
    graph.removeNodeByID(id)

    writeIfDebug(`Removed node ${id}`)
}

function onEdgeClick(evt) {
    // don't add a node
    evt.stopPropagation()
    // remove edge on screen
    $(evt.target).fadeOut('fast', function() { $(evt.target).remove() })

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

    var x1 = info1.position.left + info1.width / 2; // node 1, X
    var x2 = info2.position.left + info2.width / 2; // node 2, X
    var y1 = info1.position.top + info1.height / 2; // node 1, Y
    var y2 = info2.position.top + info2.height / 2; // node 2, Y

    if (x2 > x1 && y2 > y1) {
        startX = x1;
        startY = y1;
        minX = 0;
        minY = 0;
        maxX = x2 - x1;
        maxY = y2 - y1;
    } else if (x2 < x1 && y2 < y1) {
        startX = x2;
        startY = y2;
        minX = 0;
        minY = 0;
        maxX = x1 - x2;
        maxY = y1 - y2;
    } else if (x2 < x1 && y2 > y1) {
        startX = x2;
        startY = y1;
        minX = 0;
        minY = y2 - y1;
        maxX = x1 - x2;
        maxY = 0;
    } else if (x2 > x1 && y2 < y1) {
        console.log("Problem")
        startX = x1;
        startY = y2;
        minX = 0;
        minY = y2 - y1;
        maxX = x2 - x1;
        maxY = 0;
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
    var div = $("<div></div>")
        .attr('class', 'edge_' + node1ID + "_" + nodeID2)
        .css('position', 'absolute')
        .css('top', startY)
        .css('left', startX);

    var svg = $.parseHTML(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" shape-rendering="geometricPrecision">
                    <line id="edge-line-${node1ID}-${nodeID2}" x1="${minX}" y1="${minY}" x2="${maxX}" y2="${maxY}"
                    stroke="#E8C547" stroke-width="2"></line>
          </svg>`
      )

    div.append(svg)
    $(div).hide().appendTo(graph.container).fadeIn('fast');
};
})