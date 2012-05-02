
/*
 *  @requires jQuery
 */

namespace("WCS.Core"); // TODO: implement namespacing function
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
 *  function WCS.Core.parse
 *
 * Parses a (EO-)WCS response to JavaScript objects. Requires jQuery or a
 * similar library which has to implement namespace aware queries. (Library
 * independence not yet implemented).
 */


WCS.Core.parse = function(xml) {
    
};
