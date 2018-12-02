/* 
    The StatsPanel object represents the vertical Statistics panel on the UI. 
    It holds the graphStatsPanel and nodeStatsPanel objects. 
*/ 
class StatsPanel {
    constructor(graph) {
        this.graph = graph; 
        this.graphStatsPanel = new graphPanel(graph);  
        this.nodeStatsPanel  = new nodePanel(graph); 

        this.graphStatsPanel.init(); 
        this.nodeStatsPanel.init(); 
    }

    toggleDisplay() {
        var statsPanel = $("#statsPanel"); 
        var button = $("button#showStatsPanel"); 
        var graphDrawingPanel = $("#graphContainer"); 
        var displacement = 150; 

        if (!graph.settings.showGraphStats) {
            graph.settings.showGraphStats = true; 
            this.graphStatsPanel.update()
            statsPanel.show()
            button.text("Hide Stats Panel")
        } else {
            graph.settings.showGraphStats = false; 
            statsPanel.hide(); 
            button.text("Show Stats Panel")
        }
    }
}

var codeMirrorSettings = {
    mode:  "javascript", 
    lineNumbers: true, 
    autofocus: true, 
    autoRefresh: true, 
    // height: auto, 
    gutters: ["CodeMirror-lint-markers"],
    lint: true, 
    viewportMargin: 5
}

function graphPanel(graph) {
    gp = this, 
    this.graph              = graph, 
    this.wrapperId          = '#graphStatsPanel', 
    this.bodyElement        = 'body',
    this.launchModalElement = "#addNewGraphStat", 
    this.codeMirrorSettings = codeMirrorSettings,
    this.submitModalButton  = "enter_newGraphStat",
    this.modal              = null, 
    this.codeEditor         = {}, 
    this.modalId = 'newGraphStat',

    this.init = function() {
        this.initStatsAndUpdateUI(); 
        this.initCodeEditorModal(); 
    }, 

    this.initStatsAndUpdateUI = function() {
        var statStr = ""; 
        var graphStatsList = $(`#statsPanel ${this.wrapperId} ul`); 

    	// show graph statistics and add them as <li> tags to the list  
    	if (this.graph.settings.showGraphStats) {
    	    stats = this.graph.graphStats;  
    	    Object.entries(stats).forEach(([key, value]) => {
    	        statStr += `<li>${key}: \n</li>`; 
    	    });
    	}

        graphStatsList.html(statStr);   
    }, 

    this.initCodeEditorModal = function() {
    	// create a new modal
    	var modal = new g_modal(
    		`${this.modalId}`, 
    		'New Graph Statistic', 
        	`See the <a href='/docs/index.html#File:graph.js' target="_blank">documentation</a> for the graph properties that can be used directly in the code.`
        ); 

        // create the modal body  
    	modal.appendToBody(`
    	    <textarea id="editor" rows="15" style="height:5px;">function customStatName(graph){\n  return graph.nodes.length;\n}</textarea>
    	    <button id="${this.submitModalButton}">Add</button>
    	`); 

    	// append the modal wrapper to the body element 
    	$(this.bodyElement).append(modal.wrapper)
    	$(this.launchModalElement).click(_ => modal.showModal()); 

    	var elm = $(`#${this.modalId} #editor`)[0]; 
    	var editor = CodeMirror.fromTextArea(elm, codeMirrorSettings);
        this.codeEditor = editor; 

    	$(`#${this.submitModalButton}`).click(this.addNewGraphStat); 

        this.modal = modal; 
    }, 

    /* 
        This function adds a new graph stat. 
        It takes the node function from the value in this.codeEditor, which 
        is the code editor on the new graph stat modal. 
    */ 
    this.addNewGraphStat = function() {
    	var fn = gp.codeEditor.getValue(); 
    	var expression = fn.substring(fn.indexOf('{'), fn.length);
    	var func = new Function('{' + expression + '}')
    	var funcName = fn.match(/^function(.*)\(/)[1].trim()

    	graph.graphStats[funcName] = func;

    	gp.modal.hideModal(); // hide modal 

        gp.update() // update the UI 
    }, 

    /* 
        This function updates the value of the Graph Stats Panel
        when a node or edge is added, deleted, or changed. 
    */ 
    this.update = function() {
    	    var statsStr = ""; 
    	    var graphStatsList = $("#statsPanel #graphStatsPanel ul"); 

    	    if (graph.settings.showGraphStats) 
    	        statStr = graph.getStatValuesHtml(); 

    	    graphStatsList.html(statStr);   
    }
}

function nodePanel(graph) {
    np = this, 
    this.graph              = graph,  
    this.wrapperId          = '#nodeStatsPanel', 
    this.bodyElement        = 'body',
    this.launchModalElement = "#addNewNodeStat", 
    this.codeMirrorSettings = codeMirrorSettings,
    this.submitModalButton  = "enter_newNodeStat", // represents the ID of the button that submits in the modal, but does not include a #. 
    this.modal              = null, 
    this.codeEditor         = {}, 
    this.modalId            = 'newNodeStat',

    this.init = function() {
        this.initCodeEditorModal(); 
    }

    this.initCodeEditorModal = function() {
    	var modal = new g_modal(
    		`${this.modalId}`,
    		'New Node Statistic', 
    	    `See the <a href='/docs/index.html#File:node.js' target="_blank">documentation</a> for the node properties that can be used directly in the code.`
    	); 

    	modal.appendToBody(`
    	    <textarea id="editor" rows="15" style="height:5px;">function customStatName(node){\n  return node.neighbors.length;\n}</textarea>
    	    <button id="${this.submitModalButton}">Add</button>
        `); 

    	$(this.bodyElement).append(modal.wrapper)
    	$(this.launchModalElement).click(_ => modal.showModal()); 

        var elm = $(`#${this.modalId} #editor`)[0]; 

    	var editor = CodeMirror.fromTextArea(elm, this.codeMirrorSettings);
        this.codeEditor = editor; 

    	$(`#${this.submitModalButton}`).click(this.addNewNodeStat)

        this.modal = modal; 
    }, 

    this.toggleDisplay = function() {
        // "this" is redefined as the panel button here, use "np" to refer
        // to the node panel  
        var graph = np.graph; 

        if (!graph.settings.showNodeStats) {
            $(this).text("Hide Node Stats")

            // remove all old degree values
            // todo - remove once degree is dynamic
            $(".nodeinfo").remove()

            var stats = graph.nodeStats; 

            // show degree for each node
            $.each($(".node"), function(n, obj) {
                var id = $(obj).attr('id')
                var n = graph.getNode(id); 
                var statStr = n.getStatValuesHtml(stats, true); 
                $(obj).append(statStr)
            })

            np.updatePanel()
        } else {
            // remove all node info classes
            $(".nodeinfo").remove()
            $(this).text("Show Node Stats")
        }

        graph.settings.showNodeStats = !graph.settings.showNodeStats; 
    }, 

    /* 
        This function updates the individual stat values of a given node.  
        @node - can be a nodeID or an actual node. 
        @force - boolean that, when true, forces the value of the node to be shown even if `showNodeStats` is false. 
    */ 
    this.update = function(n, force) {
        if (this.graph.settings.showNodeStats || force) {
            if (typeof n == "string") // check if node is a node object or a node ID 
                n = this.graph.getNode(n); // if node is an ID, get the node 

            var id = n.id; 
            var stats = this.graph.nodeStats; 
            var statStr = n.getStatValuesHtml(stats, true); 
            $(`.node#${id} .nodeinfo`).html(statStr);
        }
    }, 

    /* 
        This function adds a new node stat and re-renders all node  
        infos to include that stat. It takes the function from the  
        value in this.codeEditor, which is the code editor on the 
        new node stat modal. 
    */ 
    this.addNewNodeStat = function() {
        // "this" is hidden here, use "np" 
        var fn = np.codeEditor.getValue(); 
        var expression = 'return ' + fn; 
        var func = new Function(expression)
        var funcName = fn.match(/^function(.*)\(/)[1].trim()

        np.graph.nodeStats[funcName] = func();

        // update all nodes
        if (graph.settings.showNodeStats)
            for (n of graph.nodes) {
                np.update(n)
        }

        np.modal.hideModal(); // hide modal 

        var event = new CustomEvent('nodeStatAdd');
        document.dispatchEvent(event);
    }, 

    /* 
        This function updates the Node Stats Panel with the name of the node stat functions
        when a node stat is added, deleted, or changed. 
    */ 
    this.updatePanel = function() {
        var statsStr = ""; 
        var graphStatsList = $("#statsPanel #nodeStatsPanel ul"); 

        if (np.graph.settings.showNodeStats) {
            var stats = np.graph.nodeStats; 
            Object.entries(stats).forEach(([key, fn]) => {
                statsStr += `<li>${key}</li>`; 
            });
        } 

        graphStatsList.html(statsStr); 
    }
}
