/**
 * @module core/utils
 */

'use strict';

/**
 * Convenience function to serialize an object to a KVP encoded string.
 *
 * @param obj The object to serialize
 *
 * @returns the constructed KVP string
 */

function objectToKVP(obj) {
    var ret = [];
    for (var key in obj) {
        ret.push(key + "=" + obj[key]);
    }
    return ret.join("&");
}

/**
 * Utility function to split a string and parse an array of integers.
 *
 * @param string the string to split and parse
 * @param separator an (optional) separator, the string shall be split with.
 *                   Defaults to " ".
 *
 * @returns an array of the parsed values
 */

function stringToIntArray(string, separator) {
    separator = separator || " ";
    return map(string.split(separator), function(val) {
        return parseInt(val);
    });
}

/**
 * Utility function to split a string and parse an array of floats.
 *
 * @param string the string to split and parse
 * @param separator an (optional) separator, the string shall be split with.
 *                   Defaults to " ".
 *
 * @returns an array of the parsed values
 */

function stringToFloatArray(string, separator) {
    separator = separator || " ";
    return map(string.split(separator), function(val) {
        return parseFloat(val);
    });
}

function map(array, iterator) {
    var result = [];
    for (var i = 0; i < array.length; ++i) {
        result.push(iterator(array[i]));
    }
    return result;
}

/**
 * Recursivly merges two hash-tables.
 *
 * @param target the object the other one will be merged into
 * @param other the object that will be merged into the target
 */

function deepMerge(target, other) {
    if (typeof target != "object" || typeof other != "object") return;
    for (var key in other) {
        if (target.hasOwnProperty(key)
            && typeof target[key] == "object"
            && typeof other[key] == "object") {
            deepMerge(target[key], other[key]);
        }
        else target[key] = other[key];
    }
}

/**
 * Create an xPath lookup function bound to the given namespaceMap.
 *
 * @param namespaceMap the mapping from prefix to namespace URL.
 *
 * @returns the xPath function
 */

function createXPath(namespaceMap) {
    var nsResolver = function(prefix) {
      return namespaceMap[prefix] || null;
    }

    return function(node, xpath) {
        var doc = node.ownerDocument;
        var text = xpath.indexOf("text()") != -1 || xpath.indexOf("@") != -1;
        if (text) {
            return doc.evaluate(xpath, node, nsResolver, XPathResult.STRING_TYPE, null).stringValue;
        }
        else {
            var result = doc.evaluate(xpath, node, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            if (result.snapshotLength == 0) {
               return null;
            }
            else {
                return result.snapshotItem(0);
            }
        }
    }
}

/**
 * Create an xPath lookup function (that itself returns arrays of elements)
 * bound to the given namespaceMap.
 *
 * @param namespaceMap the mapping from prefix to namespace URL.
 *
 * @returns the xPath function
 */
function createXPathArray(namespaceMap) {
    var nsResolver = function(prefix) {
      return namespaceMap[prefix] || null;
    }

    return function(node, xpath) {
        var doc = node.ownerDocument;
        var result = doc.evaluate(xpath, node, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        var text = xpath.indexOf("text()") != -1 || xpath.indexOf("@") != -1;
        var array = new Array(result.snapshotLength);
        for (var i=0; i < result.snapshotLength; ++i) {
            if (text) {
                array[i] = result.snapshotItem(i).textContent;
            }
            else {
                array[i] = result.snapshotItem(i);
            }
        }
        return array;
    }
}


module.exports = {
    objectToKVP: objectToKVP,
    stringToIntArray: stringToIntArray,
    stringToFloatArray: stringToFloatArray,
    map: map,
    deepMerge: deepMerge,
    createXPath: createXPath,
    createXPathArray: createXPathArray
}