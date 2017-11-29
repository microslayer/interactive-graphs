var writeIfDebug = msg => { if (debug) console.log(msg) }

function getArrayIndexByValue(arr, value, target)
    { return arr.findIndex(a => { return a[value] == target}) }

function remove(array, element) {
    var index = array.indexOf(element);

    if (index !== -1) {
        array.splice(index, 1);
    }
}
