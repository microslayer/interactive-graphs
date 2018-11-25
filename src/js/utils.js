// logs a message to console if debug=true
var writeIfDebug = msg => { if (debug) console.log(msg) }

// gets an array index by value
function getArrayIndexByValue(arr, value, target)
    { return arr.findIndex(a => { return a[value] == target}) }

// returns boolean value indicating whether
// an element is a node element
function isNode(elm) {
    return $(elm).is(".node") || $(elm).parents(".node").length > 0;
}

// returns a node element from a (possibly child) element
function getNodeFromChild(el) {
    var elm = $(el);

    if (!isNode(elm))
        return null;
    else if (elm.is(".node"))
        return elm;
    else
        return elm.parents(".node");
}

// returns a node element given the node ID
function getNodeElmFromID(id) {
    // ${id} is case insensitive so need filter 
    return $(`.node#${id}`).filter((index, elm) => $(elm).attr('id') == id);  
}

// removes an element from an array by value
function remove(array, element) {
    var index = array.indexOf(element);

    if (index !== -1) {
        array.splice(index, 1);
    }
}