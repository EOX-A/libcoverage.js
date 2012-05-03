/**
 *  function namespace
 *
 * Convenience function to create namespaces.
 * Taken from: http://blogger.ziesemer.com/2008/05/javascript-namespace-function.html
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
        params.push('containment=' + options.updatesequence);
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

    options = options || {};
    extraParams = extraParams || {};
    var ids = ((coverageids instanceof Array)
               ? coverageids.join(",") : coverageids;
    
    var extra = WCS.Util.objectToKVP(extraParams);
    return url + (url.charAt(url.length-1) !== "?" ? "?" : "")
            + "coverageid=" + ids + ((extra.length > 0) ? "&" + extra : "");
};

/**
 *  function WCS.Core.describeEOCoverageSetURL
 *
 * Returns a 'DescribeEOCoverageSet' request URL with parameters encoded as KVP.
 *
 * @param url: the base URL of the service
 * @param eoid: the ID of the coverage set
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
 *      -subsetTime: the subset on the time axis in the following form:
 *                   [beginTime, endTime]
 *      -containment: a string describing the containment method for all
 *                    subsets. One of "overlaps" and "contains".
 *      -count: an integer, limiting the maximum number of returned coverage
 *              descriptions within the coverage set.
 *      -sections: an array of strings for sections to be included, each one of
 *                 "CoverageDescriptions" and "DatasetSeriesDescriptions".
 *
 * @param extraParams: an object containing any extra (vendor specific)
 *                     parameters which will be appended to the query string
 *
 * @returns: the constructed request URL
 */

WCS.Core.describeEOCoverageSetURL = function(url, eoid, options, extraParams) {
    if (!url || !eoid) {
        throw new Error("Parameters 'url' and 'eoid' are mandatory.");
    }
    options = options || {};
    extraParams = extraParams || {};
    subsetCRS = options.subsetCRS || "http://www.opengis.net/def/crs/EPSG/0/4326"; // TODO: change this
    
    var params = ['service=wcs', 'version=2.0.0', 'request=describeeocoverageset', 'eoid=' + eoid];
    
    if (options.bbox && !options.subsetX && !options.subsetY) {
        options.subsetX = [options.bbox[0], options.bbox[2]];
        options.subsetY = [options.bbox[1], options.bbox[3]];
    }
    if (options.subsetX) {
        params.push('subset=x,' + subsetCRS + '(' + options.subsetX[0] + ',' + options.subsetX[1] + ')');
    }
    if (options.subsetY) {
        params.push('subset=y,' + subsetCRS + '(' + options.subsetY[0] + ',' + options.subsetY[1] + ')';
    }
    
    if (options.subsetTime) {
        params.push('subset=phenomenonTime("' + options.subsetTime[0] + '","' + options.subsetTime[1] + '")');
    }
    if (options.containment) {
        params.push('containment=' + options.containment);
    }
    if (options.count) {
        params.push('count=' + options.count);
    }
    if (options.sections) {
        params.push('sections=' + options.sections.join(","));
    }
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
    var params ["service=wcs", "version=2.0.0", "request=getcoverage",
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

WCS.Core.pushParseFunction = function(tagName, parseFunction) {
    if (WCS.Core.parseFunctions.hasOwnProperty(tagName)) {
        WCS.Core.parseFunctions[tagName].push(parseFunction);
    }
    else {
        WCS.Core.parseFunctions[tagName] = [parseFunction];
    }
};

WCS.Core.pushParseFunctions = function(obj) {
    for (var key in obj) {
        WCS.Core.addParseFunction(key, obj[key]);
    }
};

/* Push core parsing functions */
WCS.Core.pushParseFunctions({
    "Capabilities": WCS.Core.parseCapabilities,
    "ExceptionReport": WCS.Core.parseExceptionReport,
    "CoverageDescriptions": WCS.Core.parseCoverageDescriptions,
    "CoverageDescription": WCS.Core.parseCoverageDescription,
    "EOCoverageSetDescription": WCS.Core.parseEOCoverageSetDescription,
    "DatasetSeriesDescription": WCS.Core.parseDatasetSeriesDescription,
    "RectifiedGridCoverage": WCS.Core.parseCoverageDescription,
});

WCS.Core.callParseFunctions = function(tagName, $node) {
    if (WCS.Core.parseFunctions.hasOwnProperty(tagName)) {
        var funcs = WCS.Core.parseFunctions[tagName],
            result = {};
        for (var i = 0; i < funcs.length; ++i) {
            $.extend(result, funcs[i]($node));
        }
        return result;
    }
    else return;
};

/**
 *  object WCS.Core.options
 *
 * A hash-table with global options for this library. Used options with their
 * respective defaults are:
 *
 *  -throwOnException (false): whether or not aJavaScript exception shall be
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
 * @param xml: the XML string returned by the service
 *
 * @returns: depending on the response a JavaScript object with all parsed data
 *           or a collection thereof.
 */

WCS.Core.parse = function(xml) {
    $.xmlns["ows"] = "http://www.opengis.net/ows/2.0";
    $.xmlns["wcs"] = "http://www.opengis.net/wcs/2.0";
    $.xmlns["gml"] = "http://www.opengis.net/gml/3.2";
    $.xmlns["gmlcov"] = "http://www.opengis.net/gmlcov/1.0";
    $.xmlns["swe"] = "http://www.opengis.net/swe/2.0";
    
    $root = $.parseXML(xml);

    $root.children().each(function() {
        // TODO get tag name of element and call according parsing method
        var name = this.tagName;
    });
};

WCS.Core.parseCapabilities = function($node) {
    //
     //* parse TODO:
     //*
     //* serviceIdentification
         //* title
         //* abstract
         //* keywords[]
         //* serviceType
         //* serviceTypeVersion
         //* profiles[]
         //* fees[]
         //* accessConstraints[]
     //* serviceProvider:
         //* providerName
         //* providerSite
         //* serviceContact:
         //* individualName
         //* positionName
         //* contactInfo:
             //* phone:
                 //* voice
                 //* facsimile
             //* address:
                 //* deliveryPoint
                 //* city
                 //* administrativeArea
                 //* postalCode
                 //* country
                 //* electronicMailAddress
             //* onlineAddress
             //* hoursOfService
             //* contactInstructions
         //* role
     //* operations[]:
         //* name
         //* getUrl
         //* postUrl
     //* serviceMetadata?
     //* contents:
         //* coverageSummaries[]:
             //* coverageId
             //* coverageSubtype
     //
};

WCS.Core.parseExceptionReport = function($node) {
    var $exception = $node.find("ows|Exception");
    var parsed = {
        code: $exception.attr("exceptionCode");
        locator: $exception.attr("locator");
        text: $exception.find("ows|ExceptionText").text();
    };
    if (WCS.Core.options.throwOnException) {
        throw new Exception(parsed.text);
    }
    else return ret;
};

WCS.Core.parseCoverageDescriptions = function($node) {
    var func = WCS.Core.parseFunctions["CoverageDescription"];
    var descs = $.makeArray($node.filter("wcs|CoverageDescription").map(function() {
        return func($(this));
    }));

    return {coverageDescriptions: descs};
};

WCS.Core.parseCoverageDescription = function($node) {
    var stringToIntList = function(string, separator) {
        separator = separator || " ";
        return $.map(string.split(separator), function(val) {
            return parseInt(val);
        });
    }

    var stringToFloatList = function(string, separator) {
        separator = separator || " ";
        return $.map(string.split(separator), function(val) {
            return parseFloat(val);
        });
    }
    
    var $envelope = $node.find("gml|Envelope");
    var bounds = {
        projection: $envelope.attr("srsName")
        values: stringToIntList($envelope.find("gml|lowerCorner").text()).concat(
                stringToIntList($envelope.find("gml|upperCorner").text()))
    }

    var $domainSet = $node.find("gml|domainSet");
    // TODO: improve this: also take gml|low into account
    var size = $.map(stringToIntList($domainSet.find("gml|high").text()), function(val) {
        return val + 1;
    });

    // TODO: implement
    //var resolution = $.map(stringToFloatList()

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
            allowedValues: stringToIntList($field.find("swe|interval").text()),
            significantFigures: parseInt($field.find("swe|interval").text())
        };
    }));
    
    var obj {
        coverageId: $node.find("wcs|CoverageId").text(),
        dimensions: parseInt($node.find("gml|RectifiedGrid").attr("dimension")),
        bounds: bounds,
        size: size,
        resolution: [], // TODO: parse offset vectors
        origin: stringToFloatList($domainSet.find("gml|pos").text()),
        rangeType: rangeType,
        coverageSubtype: $node.find("wcs|CoverageSubtype").text(),
        supportedCRSs: $.makeArray($node.find("wcs|supportedCRS").map(function() { return $(this).text(); })),
        nativeCRS: $node.find("wcs|nativeCRS").text(),
        supportedFormats: $.makeArray($node.find("wcs|supportedFormat").map(function() { return $(this).text(); }))
    }
};
