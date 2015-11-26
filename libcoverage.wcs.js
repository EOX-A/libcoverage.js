/**
 *  function namespace
 *
 * Convenience function to create namespaces.
 * Taken from:
 *      http://blogger.ziesemer.com/2008/05/javascript-namespace-function.html
 */

var namespace = function(name, separator, container){
    var ns = name.split(separator || '.'),
        o = container || window, i, len;
    for(i = 0, len = ns.length; i < len; i++) {
        o = o[ns[i]] = o[ns[i]] || {};
    }
    return o;
};

namespace("WCS.Core");

/**
 *  module WCS.Util
 *
 * Module for several utility functions.
 */

WCS.Util = function() {

    return { /// begin public functions

    /**
     *  function WCS.Util.objectToKVP
     *
     * Convenience function to serialize an object to a KVP encoded string.
     *
     * @param obj: The object to serialize
     *
     * @returns: the constructed KVP string
     */

    objectToKVP: function(obj) {
        var ret = [];
        for (var key in obj) {
            ret.push(key + "=" + obj[key]);
        }
        return ret.join("&");
    },

    /**
     *  function WCS.Util.stringToIntArray
     *
     * Utility function to split a string and parse an array of integers.
     *
     * @param string: the string to split and parse
     * @param separator: an (optional) separator, the string shall be split with.
     *                   Defaults to " ".
     *
     * @returns: an array of the parsed values
     */

    stringToIntArray: function(string, separator) {
        separator = separator || " ";
        return WCS.Util.map(string.split(separator), function(val) {
            return parseInt(val);
        });
    },

    /**
     *  function WCS.Util.stringToFloatArray
     *
     * Utility function to split a string and parse an array of floats.
     *
     * @param string: the string to split and parse
     * @param separator: an (optional) separator, the string shall be split with.
     *                   Defaults to " ".
     *
     * @returns: an array of the parsed values
     */

    stringToFloatArray: function(string, separator) {
        separator = separator || " ";
        return WCS.Util.map(string.split(separator), function(val) {
            return parseFloat(val);
        });
    },

    getFirst: function(node, ns, tagName) {
        if (!tagName) return node;
        if (ns)
            return node.getElementsByTagNameNS(ns, tagName)[0];
        else
            return node.getElementsByTagName(tagName)[0];
    },

    getText: function(node, ns, tagName, defaultValue) {
        var first = WCS.Util.getFirst(node, ns, tagName);
        if (first)
            return first.textContent;
        else
            return defaultValue
    },

    getAll: function(node, ns, tagName) {
        if (!tagName) return [node];
        if (ns)
            return node.getElementsByTagNameNS(ns, tagName);
        else
            return node.getElementsByTagName(tagName);
    },

    getTextArray: function(node, ns, tagName) {
        var texts = [];
        var nodes = WCS.Util.getAll(node, ns, tagName);
        for (var i = 0; i < nodes.length; ++i) {
            texts.push(nodes[i].textContent);
        }
        return texts;
    },

    map: function (array, iterator) {
        var result = [];
        for (var i = 0; i < array.length; ++i) {
            result.push(iterator(array[i]));
        }
        return result;
    },

    /**
     *  function WCS.Util.deepMerge
     *
     * Recursivly merges two hash-tables.
     *
     * @param target: the object the other one will be merged into
     * @param other: the object that will be merged into the target
     */

    deepMerge: function(target, other) {
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

    } /// end public functions
} ();

/**
 *  module WCS.Core.KVP
 *
 * TODO: writeme
 *
 */

WCS.Core.KVP = function() {

    return { /// begin public functions

    /**
     *  function WCS.Core.getCapabilitiesURL
     *
     * Returns a 'GetCapabilities' request URL with parameters encoded as KVP.
     *
     * @param url: the base URL of the service
     * @param options: an object containing any the following optional parameters
     *      -updatesequence: a string identifier
     *      -sections: an array of strings for sections to be included, each one of
     *                 "ServiceIdentification", "ServiceProvider",
     *                 "OperationsMetadata" and "Contents".
     *
     * @param extraParams: an object containing any extra (vendor specific)
     *                     parameters which will be appended to the query string
     *
     * @returns: the constructed request URL
     */

    getCapabilitiesURL: function(url, options, extraParams) {
        if (!url) {
            throw new Error("Parameter 'url' is mandatory.");
        }

        options = options || {};
        extraParams = extraParams || {};
        var params = ['service=wcs', 'version=2.0.0', 'request=getcapabilities'];

        if (options.updatesequence) {
            params.push('updatesequence=' + options.updatesequence);
        }
        if (options.sections) {
            params.push('sections=' + options.sections.join(","));
        }

        var extra = WCS.Util.objectToKVP(extraParams);
        return url + (url.charAt(url.length-1) !== "?" ? "?" : "")
                + params.join("&") + ((extra.length > 0) ? "&" + extra : "");
    },

    /**
     *  function WCS.Core.describeCoverageURL
     *
     * Returns a 'DescribeCoverage' request URL with parameters encoded as KVP.
     *
     * @param url: the base URL of the service
     * @param coverageids: either a single coverage ID or an array thereof
     * @param extraParams: an object containing any extra (vendor specific)
     *      parameters which will be appended to the query string
     *
     * @returns: the constructed request URL
     */

    describeCoverageURL: function(url, coverageids, extraParams) {
        if (!url || !coverageids) {
            throw new Error("Parameters 'url' and 'coverageids' are mandatory.");
        }

        var params = ['service=wcs', 'version=2.0.0', 'request=describecoverage'];

        extraParams = extraParams || {};
        params.push('coverageid=' + ((typeof coverageids === "string")
                    ? coverageids : coverageids.join(",")));

        var extra = WCS.Util.objectToKVP(extraParams);
        return url + (url.charAt(url.length-1) !== "?" ? "?" : "")
                + params.join("&") + ((extra.length > 0) ? "&" + extra : "");
    },

    /**
     *  function WCS.Core.getCoverageSetURL
     *
     * Returns a 'GetCoverage' request URL with parameters encoded as KVP.
     *
     * @param url: the base URL of the service
     * @param coverage: the ID of the coverage
     * @param options: an object containing any the following optional parameters
     *      -format: the desired format of the returned coverage
     *      -bbox: an array of four values in the following order:
     *             [minx, miny, maxx, maxy]
     *      -subsetX: the subset of the X axis as an array in the following form:
     *                [minx, maxx]
     *      -subsetY: the subset of the Y axis as an array in the following form:
     *                [minx, maxx]
     *      -subsetCRS: the CRS definition in which the spatial subsets are
     *                  expressed in
     *      -rangesubset: an array of selected band names or indices
     *      -size: an array of two size values limiting the size for both axes
     *      -sizeX: the size of the X axis
     *      -sizeY: the size of the Y axis
     *      -resolution: an array of two resolution values specifying the
     *                   resolution for both axes
     *      -resolutionX: the resolution of the X axis
     *      -resolutionY: the resolution of the Y axis
     *      -interpolation: the interpolation method as advertised by the service
     *      -outputCRS: the CRS definition in which the coverage shall be returned
     *      -multipart: if set to true, the coverage will be returned with
     *                  according XML metadata
     *
     * @param extraParams: an object containing any extra (vendor specific)
     *                     parameters which will be appended to the query string
     *
     * @returns: the constructed request URL
     */

    getCoverageURL: function(url, coverageid, options, extraParams) {
        if (!url || !coverageid) {
            throw new Error("Parameters 'url' and 'coverageid' are mandatory.");
        }
        options = options || {};
        subsetCRS = options.subsetCRS || "http://www.opengis.net/def/crs/EPSG/0/4326";
        if (url.charAt(url.length-1) !== "?")
            url += "?";
        var params = ["service=wcs", "version=2.0.0", "request=getcoverage",
                    "coverageid=" + coverageid];

        if (options.format)
            params.push("format=" + options.format);
        if (options.bbox && !options.subsetX && !options.subsetY) {
            options.subsetX = [options.bbox[0], options.bbox[2]];
            options.subsetY = [options.bbox[1], options.bbox[3]];
        }
        if (options.subsetX)
            params.push("subset=x(" + options.subsetX[0] + ","
                        + options.subsetX[1] + ")");
        if (options.subsetY)
            params.push("subset=y(" + options.subsetY[0] + ","
                        + options.subsetY[1] + ")");
        if (options.subsetCRS)
            params.push("subsettingCrs=" + subsetCRS)
        if (options.size && !options.sizeX && !options.sizeY) {
            options.sizeX = options.size[0];
            options.sizeY = options.size[1];
        }

        var sizes = [];
        if (options.sizeX)
            sizes.push("x(" + options.sizeX + ")");
        if (options.sizeY)
            sizes.push("y(" + options.sizeY + ")");
        if (sizes.length > 0)
            params.push("scalesize=" + sizes.join(","))

        if (options.resolution && !options.resolutionX && !options.resolutionY) {
            options.resolutionX = options.resolution[0];
            options.resolutionY = options.resolution[1];
        }
        if (options.rangeSubset)
            params.push("rangesubset=" + options.rangeSubset.join(","));
        if (options.interpolation)
            params.push("interpolation=" + options.interpolation);
        if (options.outputCRS)
            params.push("outputcrs=" + options.outputCRS);
        if (options.multipart)
            params.push("mediatype=multipart/mixed");

        var extra = WCS.Util.objectToKVP(extraParams);
        return url + (url.charAt(url.length-1) !== "?" ? "?" : "")
                + params.join("&") + ((extra.length > 0) ? "&" + extra : "");
    }

    } /// end public functions
} ();


/**
 *  module WCS.Core.Parse
 *
 *
 *
 *
 */

WCS.Core.Parse = (function() {

    /// begin private fields

    var parseXml;

    if (typeof window.DOMParser != "undefined") {
        parseXml = function(xmlStr) {
            return ( new window.DOMParser() ).parseFromString(xmlStr, "text/xml");
        };
    } else if (typeof window.ActiveXObject != "undefined" &&
           new window.ActiveXObject("Microsoft.XMLDOM")) {
        parseXml = function(xmlStr) {
            var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = "false";
            xmlDoc.loadXML(xmlStr);
            return xmlDoc;
        };
    }

    /**
     *  object WCS.Core.parseFunctions (private)
     *
     * A hash-table associating the node name of common WCS objects with their
     * according parse function. All parse functions shall have take a jQuery
     * object wrapping the current node as their only parameter.
     */

    var parseFunctions = {};

    /* setup global namespace declarations */

    var ns = {
        xlink: "http://www.w3.org/1999/xlink",
        ows: "http://www.opengis.net/ows/2.0",
        wcs: "http://www.opengis.net/wcs/2.0",
        gml: "http://www.opengis.net/gml/3.2",
        gmlcov: "http://www.opengis.net/gmlcov/1.0",
        swe: "http://www.opengis.net/swe/2.0",
        crs: "http://www.opengis.net/wcs/crs/1.0",
        int: "http://www.opengis.net/wcs/interpolation/1.0"
    }

    var nsResolver = function(prefix) {
      return ns[prefix] || null;
    }

    var xPath = function(node, xpath) {
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

    var xPathArray = function(node, xpath) {
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

    /// end private fields

    /**
     *  function WCS.Core.pushParseFunction
     *
     * Registers a new node parsing function for a specified tagName. A function
     * can be registered to multiple tagNames.
     *
     * @param tagName: the tagName the function is registered to
     *
     * @param parseFunction: the function to be executed. The function shall
     *                       receive the tag name and a wrapped DOM object
     *                       as parameters and shall return an object of all parsed
     *                       attributes. For extension parsing functions only
     *                       extensive properties shall be parsed.
     */

    var pushParseFunction = function(tagName, parseFunction) {
        if (parseFunctions.hasOwnProperty(tagName)) {
            parseFunctions[tagName].push(parseFunction);
        }
        else {
            parseFunctions[tagName] = [parseFunction];
        }
    };

    /**
     *  function WCS.Core.pushParseFunctions
     *
     * Convenience function to push multiple parsing functions at one. The same
     * rules as with `WCS.Core.pushParseFunction` apply here.
     *
     * @params: a hash-table with key-value pairs, where the key is the tag name
     *          and the value the parsing function.
     */

    var pushParseFunctions = function(obj) {
        for (var key in obj) {
            pushParseFunction(key, obj[key]);
        }
    };

    /**
     *  function WCS.Core.callParseFunctions
     *
     * Calls all registered functions for a specified node name. A merged object
     * with all results of each function is returned.
     *
     * @param tagName: the tagName of the node to be parsed
     *
     * @param node: the (jQuery) wrapped DOM object
     *
     * @return: the merged object of all parsing results
     */

    var callParseFunctions = function(tagName, node) {
        if (parseFunctions.hasOwnProperty(tagName)) {
            var funcs = parseFunctions[tagName],
                endResult = {};
            for (var i = 0; i < funcs.length; ++i) {
                var result = funcs[i](node);
                WCS.Util.deepMerge(endResult, result);
            }
            return endResult;
        }
        else
            throw new Error("No parsing function for tag name '" + tagName + "' registered.");
    };

    /**
     *  object WCS.Core.options
     *
     * A hash-table with global options for this library. Used options with their
     * respective defaults are:
     *
     *  -throwOnException (false): whether or not a JavaScript exception shall be
     *                             thrown when an ows:ExceptionReport is parsed.
     */

    var options = {
        throwOnException: false
    };

    var map = WCS.Util.map;

    /**
     *  function WCS.Core.parse
     *
     * Parses a (EO-)WCS response to JavaScript objects. Requires jQuery or a
     * similar library which has to implement namespace aware queries. (Library
     * independence not yet implemented).
     *
     * @param xml: the XML string to be parsed
     *
     * @returns: depending on the response a JavaScript object with all parsed data
     *           or a collection thereof.
     */

    var parse = function(xml) {
        var root;
        if (typeof xml === "string") {
            root = parseXml(xml).documentElement;
        }
        else {
            root = xml.documentElement;
        }
        return WCS.Core.Parse.callParseFunctions(root.localName, root);
    };


    /**
     *  function WCS.Core.parseExceptionReport
     *
     * Parsing function for ows:ExceptionReport elements.
     *
     * @param node: the (jQuery) wrapped DOM object
     *
     * @returns: the parsed object
     */

    var parseExceptionReport = function(node) {
        var exception = xPath(node, "ows:Exception");
        var parsed = {
            "code": exception.getAttribute("exceptionCode"),
            "locator": exception.getAttribute("locator"),
            "text": xPath(exception, "ows:ExceptionText/text()")
        };
        if (options.throwOnException) {
            var e = new Exception(parsed.text);
            e.locator = parsed.locator;
            e.code = parsed.code;
            throw e;
        }
        else return parsed;
    };

    /**
     *  function WCS.Core.parseCapabilities
     *
     * Parsing function for wcs:Capabilities elements.
     *
     * @param node: the (jQuery) wrapped DOM object
     *
     * @returns: the parsed object
     */

    var parseCapabilities = function(node) {
        return {
            "serviceIdentification": {
                "title": xPath(node, "ows:ServiceIdentification/ows:Title/text()"),
                "abstract": xPath(node, "ows:ServiceIdentification/ows:Abstract/text()"),
                "keywords": xPathArray(node, "ows:ServiceIdentification/ows:Keywords/ows:Keyword/text()"),
                "serviceType": xPath(node, "ows:ServiceIdentification/ows:ServiceType/text()"),
                "serviceTypeVersion": xPath(node, "ows:ServiceIdentification/ows:ServiceTypeVersion/text()"),
                "profiles": xPathArray(node, "ows:ServiceIdentification/ows:Profile/text()"),
                "fees": xPath(node, "ows:ServiceIdentification/ows:Fees/text()"),
                "accessConstraints": xPath(node, "ows:ServiceIdentification/ows:AccessConstraints/text()")
            },
            "serviceProvider": {
                "providerName": xPath(node, "ows:ServiceProvider/ows:ProviderName/text()"),
                "providerSite": xPath(node, "ows:ServiceProvider/ows:ProviderSite/@xlink:href"),
                "individualName": xPath(node, "ows:ServiceProvider/ows:ServiceContact/ows:IndividualName/text()"),
                "positionName": xPath(node, "ows:ServiceProvider/ows:ServiceContact/ows:PositionName/text()"),
                "contactInfo": {
                    "phone": {
                        "voice": xPath(node, "ows:ServiceProvider/ows:ServiceContact/ows:ContactInfo/ows:Phone/ows:Voice/text()"),
                        "facsimile": xPath(node, "ows:ServiceProvider/ows:ServiceContact/ows:ContactInfo/ows:Phone/ows:Facsimile/text()")
                    },
                    "address": {
                        "deliveryPoint": xPath(node, "ows:ServiceProvider/ows:ServiceContact/ows:ContactInfo/ows:Address/ows:DeliveryPoint/text()"),
                        "city": xPath(node, "ows:ServiceProvider/ows:ServiceContact/ows:ContactInfo/ows:Address/ows:City/text()"),
                        "administrativeArea": xPath(node, "ows:ServiceProvider/ows:ServiceContact/ows:ContactInfo/ows:Address/ows:AdministrativeArea/text()"),
                        "postalCode": xPath(node, "ows:ServiceProvider/ows:ServiceContact/ows:ContactInfo/ows:Address/ows:PostalCode/text()"),
                        "country": xPath(node, "ows:ServiceProvider/ows:ServiceContact/ows:ContactInfo/ows:Address/ows:Country/text()"),
                        "electronicMailAddress": xPath(node, "ows:ServiceProvider/ows:ServiceContact/ows:ContactInfo/ows:Address/ows:ElectronicMailAddress/text()")
                    },
                    "onlineResource": xPath(node, "ows:ServiceProvider/ows:ServiceContact/ows:ContactInfo/ows:OnlineResource/@xlink:href"),
                    "hoursOfService": xPath(node, "ows:ServiceProvider/ows:ServiceContact/ows:ContactInfo/ows:HoursOfService/text()"),
                    "contactInstructions": xPath(node, "ows:ServiceProvider/ows:ServiceContact/ows:ContactInfo/ows:ContactInstructions/text()")
                },
                "role": xPath(node, "ows:ServiceProvider/ows:ServiceContact/ows:Role/text()")
            },
            "serviceMetadata": {
                "formatsSupported": xPathArray(node, "wcs:ServiceMetadata/wcs:formatSupported/text()"),
                "crssSupported": xPathArray(node, "wcs:ServiceMetadata/wcs:Extension/crs:CrsMetadata/crs:crsSupported/text()"),
                "interpolationsSupported": xPathArray(node, "wcs:ServiceMetadata/wcs:Extension/int:InterpolationMetadata/int:InterpolationSupported/text()")
            },
            "operations": map(xPathArray(node, "ows:OperationsMetadata/ows:Operation"), function(op) {
                return {
                    "name": op.getAttribute("name"),
                    "getUrl": xPath(op, "ows:DCP/ows:HTTP/ows:Get/@xlink:href"),
                    "postUrl": xPath(op, "ows:DCP/ows:HTTP/ows:Post/@xlink:href")
                };
            }),
            "contents": {
                "coverages": map(xPathArray(node, "wcs:Contents/wcs:CoverageSummary"), function(sum) {
                    return {
                        "coverageId": xPath(sum, "wcs:CoverageId/text()"),
                        "coverageSubtype": xPath(sum, "wcs:CoverageSubtype/text()")
                    };
                })
            }
        };
    };

    /**
     *  function WCS.Core.parseCoverageDescriptions
     *
     * Parsing function for wcs:CoverageDescriptions elements.
     *
     * @param node: the (jQuery) wrapped DOM object
     *
     * @returns: the parsed object
     */

    var parseCoverageDescriptions = function(node) {
        var descs = map(xPathArray(node, "wcs:CoverageDescription"), function(desc) {
            return WCS.Core.Parse.callParseFunctions(desc.localName, desc);
        });
        return {"coverageDescriptions": descs};
    };

    /**
     *  function WCS.Core.parseCoverageDescription
     *
     * Parsing function for wcs:CoverageDescription elements.
     *
     * @param node: the (jQuery) wrapped DOM object
     *
     * @returns: the parsed object
     */

    var parseCoverageDescription = function(node) {
        var low = WCS.Util.stringToIntArray(xPath(node, "gml:domainSet/gml:RectifiedGrid/gml:limits/gml:GridEnvelope/gml:low/text()|gml:domainSet/gml:ReferenceableGrid/gml:limits/gml:GridEnvelope/gml:low/text()")),
            high = WCS.Util.stringToIntArray(xPath(node, "gml:domainSet/gml:RectifiedGrid/gml:limits/gml:GridEnvelope/gml:high/text()|gml:domainSet/gml:ReferenceableGrid/gml:limits/gml:GridEnvelope/gml:high/text()"));

        var size = [];
        for (var i = 0; i < Math.min(low.length, high.length); ++i) {
            size.push(high[i] + 1 - low[i]);
        }

        var pos = xPath(node, "gml:domainSet/gml:RectifiedGrid/gml:origin/gml:Point/gml:pos/text()");
        if (pos !== "") {
            var origin = WCS.Util.stringToFloatArray(pos);
        }
        var offsetVectors = map(xPathArray(node, "gml:domainSet/gml:RectifiedGrid/gml:offsetVector/text()"), function(offsetVector) {
            return WCS.Util.stringToFloatArray(offsetVector);
        });

        // simplified resolution interface. does not make sense for not axis
        // aligned offset vectors.
        var resolution = [];
        for (var i = 0; i < offsetVectors.length; ++i) {
            for (var j = 0; j < offsetVectors.length; ++j) {
                if (offsetVectors[j][i] != 0.0) {
                    resolution.push(offsetVectors[j][i]);
                }
                continue;
            }
        }

        // get the grid, either rectified or referenceable
        var grid = xPath(node, "gml:domainSet/gml:RectifiedGrid");
        if (!grid) grid = xPath(node, "gml:domainSet/gml:ReferenceableGrid");

        var obj = {
            "coverageId": xPath(node, "wcs:CoverageId/text()"),
            "dimensions": parseInt(xPath(node, "gml:domainSet/gml:RectifiedGrid/@dimension|gml:domainSet/gml:ReferenceableGrid/@dimension")),
            "bounds": {
                "projection": xPath(node, "gml:boundedBy/gml:Envelope/@srsName"),
                "lower": WCS.Util.stringToFloatArray(xPath(node, "gml:boundedBy/gml:Envelope/gml:lowerCorner/text()")),
                "upper": WCS.Util.stringToFloatArray(xPath(node, "gml:boundedBy/gml:Envelope/gml:upperCorner/text()"))
            },
            "envelope": {
                "low": low,
                "high": high
            },
            "size": size,
            "origin": origin,
            "offsetVectors": offsetVectors,
            "resolution": resolution,
            "rangeType": map(xPathArray(node, "gmlcov:rangeType/swe:DataRecord/swe:field"), function(field) {
                return {
                    "name": field.getAttribute("name"),
                    "description": xPath(field, "swe:Quantity/swe:description/text()"),
                    "uom": xPath(field, "swe:Quantity/swe:uom/@code"),
                    "nilValues": map(xPathArray(field, "swe:Quantity/swe:nilValues/swe:NilValues/swe:nilValue"), function(nilValue) {
                        return {
                            "value": parseInt(nilValue.textContent),
                            "reason": nilValue.getAttribute("reason")
                        }
                    }),
                    "allowedValues": WCS.Util.stringToFloatArray(xPath(field, "swe:Quantity/swe:constraint/swe:AllowedValues/swe:interval/text()")),
                    "significantFigures": parseInt(xPath(field, "swe:Quantity/swe:constraint/swe:AllowedValues/swe:significantFigures/text()"))
                };
            }),
            "coverageSubtype": xPath(node, "wcs:ServiceParameters/wcs:CoverageSubtype/text()"),
            "nativeFormat": xPath(node, "wcs:ServiceParameters/wcs:nativeFormat/text()")
        };

        return obj;
    };

    /* Push core parsing functions */
    pushParseFunctions({
        "Capabilities": parseCapabilities,
        "ExceptionReport": parseExceptionReport,
        "CoverageDescriptions": parseCoverageDescriptions,
        "CoverageDescription": parseCoverageDescription,
        "RectifiedGridCoverage": parseCoverageDescription
    });

    /// public functions/objects

    var publicSymbols = {
        "pushParseFunction": pushParseFunction,
        "pushParseFunctions": pushParseFunctions,
        "parse": parse,
        "callParseFunctions": callParseFunctions,
        "options": options
    }

    /// end public functions

    return publicSymbols;

}) ();
