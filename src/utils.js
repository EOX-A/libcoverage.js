/**
 * @module utils
 */

'use strict';

/**
 * @function objectToKVP
 *
 * Convenience function to serialize an object to a KVP encoded string.
 *
 * @param obj: The object to serialize
 *
 * @returns: the constructed KVP string
 */

function objectToKVP(obj) {
    var ret = [];
    for (var key in obj) {
        ret.push(key + "=" + obj[key]);
    }
    return ret.join("&");
}

/**
 * @function stringToIntArray
 *
 * Utility function to split a string and parse an array of integers.
 *
 * @param string: the string to split and parse
 * @param separator: an (optional) separator, the string shall be split with.
 *                   Defaults to " ".
 *
 * @returns: an array of the parsed values
 */

function stringToIntArray(string, separator) {
    separator = separator || " ";
    return WCS.Util.map(string.split(separator), function(val) {
        return parseInt(val);
    });
}

/**
 * @function stringToFloatArray
 *
 * Utility function to split a string and parse an array of floats.
 *
 * @param string: the string to split and parse
 * @param separator: an (optional) separator, the string shall be split with.
 *                   Defaults to " ".
 *
 * @returns: an array of the parsed values
 */

function stringToFloatArray(string, separator) {
    separator = separator || " ";
    return WCS.Util.map(string.split(separator), function(val) {
        return parseFloat(val);
    });
}

function getFirst(node, ns, tagName) {
    if (!tagName) return node;
    if (ns)
        return node.getElementsByTagNameNS(ns, tagName)[0];
    else
        return node.getElementsByTagName(tagName)[0];
}

function getText(node, ns, tagName, defaultValue) {
    var first = WCS.Util.getFirst(node, ns, tagName);
    if (first)
        return first.textContent;
    else
        return defaultValue
}

function getAll(node, ns, tagName) {
    if (!tagName) return [node];
    if (ns)
        return node.getElementsByTagNameNS(ns, tagName);
    else
        return node.getElementsByTagName(tagName);
}

function getTextArray(node, ns, tagName) {
    var texts = [];
    var nodes = WCS.Util.getAll(node, ns, tagName);
    for (var i = 0; i < nodes.length; ++i) {
        texts.push(nodes[i].textContent);
    }
    return texts;
}

function map(array, iterator) {
    var result = [];
    for (var i = 0; i < array.length; ++i) {
        result.push(iterator(array[i]));
    }
    return result;
}

/**
 * @function deepMerge
 *
 * Recursivly merges two hash-tables.
 *
 * @param target: the object the other one will be merged into
 * @param other: the object that will be merged into the target
 */

function deepMerge(target, other) {
    if (typeof target != "object" || typeof other != "object") return;
    for (var key in other) {
        if (target.hasOwnProperty(key)
            && typeof target[key] == "object"
            && typeof other[key] == "object") {
            WCS.Util.deepMerge(target[key], other[key]);
        }
        else target[key] = other[key];
    }
}


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
            result = doc.evaluate(xpath, node, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            if (result.snapshotLength == 0) {
               return null;
            }
            else {
                return result.snapshotItem(0);
            }
        }
    }
}

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
    getFirst: getFirst,
    getText: getText,
    getAll: getAll,
    getTextArray: getTextArray,
    map: map,
    deepMerge: deepMerge,
    createXPath: createXPath,
    createXPathArray: createXPathArray
}