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
namespace("WCS.Util");

/**
 *  function WCS.Util.objectToKVP
 *
 * Convenience function to serialize an object to a KVP encoded string.
 *
 * @param obj: The object to serialize
 *
 * @returns: the constructed KVP string
 */

WCS.Util.objectToKVP = function(obj) {
    var ret = [];
    for (var key in obj) {
        ret.push(key + "=" + obj[key]);
    }
    return ret.join("&");
};

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

WCS.Util.stringToIntArray = function(string, separator) {
    separator = separator || " ";
    return $.map(string.split(separator), function(val) {
        return parseInt(val);
    });
};

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

WCS.Util.stringToFloatArray = function(string, separator) {
    separator = separator || " ";
    return $.map(string.split(separator), function(val) {
        return parseFloat(val);
    });
};

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

WCS.Core.getCapabilitiesURL = function(url, options, extraParams) {
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
};

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

WCS.Core.describeCoverageURL = function(url, coverageids, extraParams) {
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
};

/**
 *  function WCS.Core.getCoverageSetURL
 *
 * Returns a 'GetCoverage' request URL with parameters encoded as KVP.
 *
 * @param url: the base URL of the service
 * @param coverage: the ID of the coverage
 * @param format: the desired format of the returned coverage
 * @param options: an object containing any the following optional parameters
 *
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

WCS.Core.getCoverageURL = function(url, coverageid, format, options, extraParams) {
    if (!url || !coverageid || !format) {
        throw new Error("Parameters 'url', 'coverageid' and 'format' are mandatory.");
    }
    options = options || {};
    subsetCRS = options.subsetCRS || "http://www.opengis.net/def/crs/EPSG/0/4326";
    if (url.charAt(url.length-1) !== "?")
        url += "?";
    var params = ["service=wcs", "version=2.0.0", "request=getcoverage",
                "coverageid=" + coverageid, "format=" + format];

    if (options.bbox && !options.subsetX && !options.subsetY) {
        options.subsetX = [options.bbox[0], options.bbox[2]];
        options.subsetY = [options.bbox[1], options.bbox[3]];
    }
    if (options.subsetX)
        params.push("subset=x," + subsetCRS + "(" + options.subsetX[0] + ","
                    + options.subsetX[1] + ")");
    if (options.subsetY)
        params.push("subset=y," + subsetCRS + "(" + options.subsetY[0] + ","
                    + options.subsetY[1] + ")");
    if (options.size && !options.sizeX && !options.sizeY) {
        options.sizeX = options.size[0];
        options.sizeY = options.size[1];
    }
    if (options.sizeX)
        params.push("size=x(" + options.sizeX + ")");
    if (options.sizeY)
        params.push("size=y(" + options.sizeY + ")");
    if (options.resolution && !options.resolutionX && !options.resolutionY) {
        options.resolutionX = options.resolution[0];
        options.resolutionY = options.resolution[1];
    }
    if (options.rangeSubset)
        params.push("rangesubset=" + options.rangeSubset.join(","));
    if (options.resolutionX)
        params.push("resolution=x(" + options.resolutionX + ")");
    if (options.resolutionY)
        params.push("resolution=y(" + options.resolutionY + ")");
    if (options.interpolation)
        params.push("interpolation=" + options.interpolation);
    if (options.outputCRS)
        params.push("outputcrs=" + options.outputCRS);
    if (options.multipart)
        params.push("mediatype=multipart/mixed");
    
    var extra = WCS.Util.objectToKVP(extraParams);
    return url + (url.charAt(url.length-1) !== "?" ? "?" : "")
            + params.join("&") + ((extra.length > 0) ? "&" + extra : "");
};

/**
 *  object WCS.Core.parseFunctions
 *
 * A hash-table associating the node name of common WCS objects with their
 * according parse function. All parse functions shall have take a jQuery
 * object wrapping the current node as their only parameter.
 */
// TODO: internal (private) variable would be more suiteable
WCS.Core.parseFunctions = {};

/**
 *  function WCS.Core.pushParseFunction
 *
 * Registers a new node parsing function for a specified tagName. A function
 * can be registered to multiple tagNames.
 *
 * @param tagName: the tagName the function is registered to
 *
 * @param parseFunction: the function to be executed. The function shall
 *                       receive the tag name and a (jQuery) wrapped DOM object
 *                       as parameters and shall return an object of all parsed
 *                       attributes. For extension parsing functions only
 *                       extensive properties shall be parsed.
 */

WCS.Core.pushParseFunction = function(tagName, parseFunction) {
    if (WCS.Core.parseFunctions.hasOwnProperty(tagName)) {
        WCS.Core.parseFunctions[tagName].push(parseFunction);
    }
    else {
        WCS.Core.parseFunctions[tagName] = [parseFunction];
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

WCS.Core.pushParseFunctions = function(obj) {
    for (var key in obj) {
        WCS.Core.pushParseFunction(key, obj[key]);
    }
};

/**
 *  function WCS.Util.deepMerge
 *
 * Recursivly merges two hash-tables.
 *
 * @param target: the object the other one will be merged into
 *
 * @param other: the object that will be merged into the target
 */

WCS.Util.deepMerge = function(target, other) {
    if (typeof target != "object" || typeof other != "object") return;
    for (var key in other) {
        if (target.hasOwnProperty(key)
            && typeof target[key] == "object"
            && typeof other[key] == "object") {
            WCS.Util.deepMerge(target[key], other[key]);
        }
        else target[key] = other[key];
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
 * @param $node: the (jQuery) wrapped DOM object
 *
 * @return: the merged object of all parsing results
 */

WCS.Core.callParseFunctions = function(tagName, $node) {
    if (WCS.Core.parseFunctions.hasOwnProperty(tagName)) {
        var funcs = WCS.Core.parseFunctions[tagName],
            endResult = {};
        for (var i = 0; i < funcs.length; ++i) {
            var result = funcs[i]($node);
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

WCS.Core.options = {
    throwOnException: false
}

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

WCS.Core.parse = function(xml) {
    var root = $.parseXML(xml).documentElement;
    return WCS.Core.callParseFunctions(root.localName, $(root));
};

/**
 *  function WCS.Core.parseCapabilities
 *
 * Parsing function for wcs:Capabilities elements.
 *
 * @param $node: the (jQuery) wrapped DOM object
 *
 * @returns: the parsed object
 */

WCS.Core.parseCapabilities = function($node) {
    var $id = $node.find("ows|ServiceIdentification");
    var $prov = $node.find("ows|ServiceProvider");
    
    return {
        serviceIdentification: {
            title: $id.find("ows|Title").text(),
            abstract: $id.find("ows|Abstract").text(),
            keywords: $.makeArray($id.find("ows|Keyword").map(function() {
                return $(this).text();
            })),
            serviceType: $id.find("ows|ServiceType").text(),
            serviceTypeVersion: $id.find("ows|ServiceTypeVersion").text(),
            profiles: $.makeArray($id.find("ows|Profile").map(function() {
                return $(this).text();
            })),
            fees: $id.find("ows|Fees").text(),
            accessConstraints: $id.find("ows|AccessConstraints").text()
        },
        serviceProvider: {
            providerName: $prov.find("ows|ProviderName").text(),
            providerSite: $prov.find("ows|ProviderSite").attr("xlink:href"),
            individualName: $prov.find("ows|IndividualName").text(),
            positionName: $prov.find("ows|PositionName").text(),
            contactInfo: {
                phone: {
                    voice: $prov.find("ows|Phone ows|Voice").text(),
                    facsimile: $prov.find("ows|Phone ows|Facsimile").text()
                },
                address: {
                    deliveryPoint: $prov.find("ows|Address ows|DeliveryPoint").text(),
                    city: $prov.find("ows|Address ows|City").text(),
                    administrativeArea: $prov.find("ows|Address ows|AdministrativeArea").text(),
                    postalCode: $prov.find("ows|Address ows|PostalCode").text(),
                    country: $prov.find("ows|Address ows|Country").text(),
                    electronicMailAddress: $prov.find("ows|Address ows|ElectronicMailAddress").text(),
                },
                onlineResource: $prov.find("ows|OnlineResource").attr("xlink:href"),
                hoursOfService: $prov.find("ows|HoursOfService").text(),
                contactInstructions:$prov.find("ows|ContactInstructions").text()
            },
            role: $prov.find("ows|Role").text()
        },
        operations: $.makeArray($node.find("ows|OperationsMetadata ows|Operation").map(function() {
            var $op = $(this);
            return {
                name: $op.attr("name"),
                getUrl: $op.find("ows|Post").attr("xlink:href"),
                postUrl: $op.find("ows|Get").attr("xlink:href")
            };
        })),
        contents: {
            coverages: $.makeArray($node.find("wcs|Contents wcs|CoverageSummary").map(function() {
                var $sum = $(this);
                return {
                    coverageId: $sum.find("wcs|CoverageId").text(),
                    coverageSubtype: $sum.find("wcs|CoverageSubtype").text()
                };
            }))
        }
    };
};

/**
 *  function WCS.Core.parseExceptionReport
 *
 * Parsing function for ows:ExceptionReport elements.
 *
 * @param $node: the (jQuery) wrapped DOM object
 *
 * @returns: the parsed object
 */

WCS.Core.parseExceptionReport = function($node) {
    var $exception = $node.find("ows|Exception");
    var parsed = {
        code: $exception.attr("exceptionCode"),
        locator: $exception.attr("locator"),
        text: $exception.find("ows|ExceptionText").text()
    };
    if (WCS.Core.options.throwOnException) {
        throw new Exception(parsed.text);
    }
    else return parsed;
};

/**
 *  function WCS.Core.parseCoverageDescriptions
 *
 * Parsing function for wcs:CoverageDescriptions elements.
 *
 * @param $node: the (jQuery) wrapped DOM object
 *
 * @returns: the parsed object
 */

WCS.Core.parseCoverageDescriptions = function($node) {
    var func = WCS.Core.parseFunctions["CoverageDescription"];
    var descs = $.makeArray($node.find("wcs|CoverageDescription").map(function() {
        return WCS.Core.callParseFunctions(this.localName, $(this));
    }));
    return {coverageDescriptions: descs};
};

/**
 *  function WCS.Core.parseCoverageDescription
 *
 * Parsing function for wcs:CoverageDescription elements.
 *
 * @param $node: the (jQuery) wrapped DOM object
 *
 * @returns: the parsed object
 */

WCS.Core.parseCoverageDescription = function($node) {
    var $envelope = $node.find("gml|Envelope");
    var bounds = {
        projection: $envelope.attr("srsName"),
        values: WCS.Util.stringToFloatArray($envelope.find("gml|lowerCorner").text()).concat(
                WCS.Util.stringToFloatArray($envelope.find("gml|upperCorner").text()))
    };

    var $domainSet = $node.find("gml|domainSet");
    // TODO: improve this: also take gml|low into account
    var size = $.map(WCS.Util.stringToIntArray($domainSet.find("gml|high").text()), function(val) {
        return val + 1;
    });

    // TODO: implement
    //var resolution = $.map(WCS.Util.stringToFloatArray()

    var rangeType = $.makeArray($node.find("swe|field").map(function() {
        var $field = $(this);
        return {
            name: $field.attr("name"),
            description: $field.find("swe|description").text(),
            uom: $field.find("swe|uom").attr("code"),
            nilValues: $.makeArray($field.find("swe|nilValue").map(function(){
                var $nilValue = $(this);
                return {
                    value: parseInt($nilValue.text()),
                    reason: $nilValue.attr("reason")
                }
            })),
            allowedValues: WCS.Util.stringToIntArray($field.find("swe|interval").text()),
            significantFigures: parseInt($field.find("swe|significantFigures").text())
        };
    }));
    
    var obj = {
        coverageId: $node.find("wcs|CoverageId").text(),
        dimensions: parseInt($node.find("gml|RectifiedGrid").attr("dimension")),
        bounds: bounds,
        size: size,
        resolution: [], // TODO: parse offset vectors
        origin: WCS.Util.stringToFloatArray($domainSet.find("gml|pos").text()),
        rangeType: rangeType,
        coverageSubtype: $node.find("wcs|CoverageSubtype").text(),
        supportedCRSs: $.makeArray($node.find("wcs|supportedCRS").map(function() { return $(this).text(); })),
        nativeCRS: $node.find("wcs|nativeCRS").text(),
        supportedFormats: $.makeArray($node.find("wcs|supportedFormat").map(function() { return $(this).text(); }))
    };

    return obj;
};

/* setup global namespace declarations */
$.xmlns["xlink"] = "http://www.w3.org/1999/xlink";
$.xmlns["ows"] = "http://www.opengis.net/ows/2.0";
$.xmlns["wcs"] = "http://www.opengis.net/wcs/2.0";
$.xmlns["gml"] = "http://www.opengis.net/gml/3.2";
$.xmlns["gmlcov"] = "http://www.opengis.net/gmlcov/1.0";
$.xmlns["swe"] = "http://www.opengis.net/swe/2.0";

/* Push core parsing functions */
WCS.Core.pushParseFunctions({
    "Capabilities": WCS.Core.parseCapabilities,
    "ExceptionReport": WCS.Core.parseExceptionReport,
    "CoverageDescriptions": WCS.Core.parseCoverageDescriptions,
    "CoverageDescription": WCS.Core.parseCoverageDescription,
    "RectifiedGridCoverage": WCS.Core.parseCoverageDescription,
});

