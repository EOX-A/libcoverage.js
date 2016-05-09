/**
 * @module eowcs/kvp
 */

'use strict';

var utils = require("../utils");

/**
 * Returns a 'DescribeEOCoverageSet' request URL with parameters encoded as KVP.
 *
 * @param url the base URL of the service
 * @param eoid the ID of the coverage set
 * @param options an object containing any the following optional parameters
 * @param options.bbox an array of four values in the following order:
 *                     [minx, miny, maxx, maxy]
 * @param options.subsetX the subset of the X axis as an array in the following form:
 *                        [minx, maxx]
 * @param options.subsetY the subset of the Y axis as an array in the following form:
 *                        [minx, maxx]
 * @param options.subsetCRS the CRS definition in which the spatial subsets are
 *                          expressed in
 * @param options.subsetTime the subset on the time axis in the following form:
 *                           [beginTime, endTime]
 * @param options.containment a string describing the containment method for all
 *                            subsets. One of "overlaps" and "contains".
 * @param options.count an integer, limiting the maximum number of returned coverage
 *                       descriptions within the coverage set.
 * @param options.sections an array of strings for sections to be included, each one of
 *                          "CoverageDescriptions" and "DatasetSeriesDescriptions".
 *
 * @param extraParams an object containing any extra (vendor specific)
 *                    parameters which will be appended to the query string
 *
 * @returns the constructed request URL
 */

function describeEOCoverageSetURL(url, eoid, options, extraParams) {
    if (!url || !eoid) {
        throw new Error("Parameters 'url' and 'eoid' are mandatory.");
    }
    options = options || {};
    extraParams = extraParams || {};

    var params = ['service=wcs', 'version=2.0.0', 'request=describeeocoverageset', 'eoid=' + eoid];

    if (options.bbox && !options.subsetX && !options.subsetY) {
        options.subsetX = [options.bbox[0], options.bbox[2]];
        options.subsetY = [options.bbox[1], options.bbox[3]];
    }
    if (options.subsetX) {
        params.push('subset=x(' + options.subsetX[0] + ',' + options.subsetX[1] + ')');
    }
    if (options.subsetY) {
        params.push('subset=y(' + options.subsetY[0] + ',' + options.subsetY[1] + ')');
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
    var extra = utils.objectToKVP(extraParams);
    return url + (url.charAt(url.length-1) !== "?" ? "?" : "")
            + params.join("&") + ((extra.length > 0) ? "&" + extra : "");
}

module.exports = {
    describeEOCoverageSetURL: describeEOCoverageSetURL
};
