/**
 * @module core/kvp
 */

'use strict';

var utils = require("./utils");

/**
 * Returns a 'GetCapabilities' request URL with parameters encoded as KVP.
 *
 * @param url the base URL of the service
 * @param options an object containing any the following optional parameters
 * @param updatesequence a string identifier
 * @param sections an array of strings for sections to be included, each one of
 *                 "ServiceIdentification", "ServiceProvider",
 *                 "OperationsMetadata" and "Contents".
 *
 * @param extraParams an object containing any extra (vendor specific)
 *                    parameters which will be appended to the query string
 *
 * @returns the constructed request URL
 */

function getCapabilitiesURL(url, options, extraParams) {
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

    var extra = utils.objectToKVP(extraParams);
    return url + (url.charAt(url.length-1) !== "?" ? "?" : "")
            + params.join("&") + ((extra.length > 0) ? "&" + extra : "");
}

/**
 * Returns a 'DescribeCoverage' request URL with parameters encoded as KVP.
 *
 * @param url the base URL of the service
 * @param {Array|string} coverageids either a single coverage ID or an array thereof
 * @param extraParams an object containing any extra (vendor specific)
 *                    parameters which will be appended to the query string
 *
 * @returns the constructed request URL
 */

function describeCoverageURL(url, coverageids, extraParams) {
    if (!url || !coverageids) {
        throw new Error("Parameters 'url' and 'coverageids' are mandatory.");
    }

    var params = ['service=wcs', 'version=2.0.0', 'request=describecoverage'];

    extraParams = extraParams || {};
    params.push('coverageid=' + ((typeof coverageids === "string")
                ? coverageids : coverageids.join(",")));

    var extra = utils.objectToKVP(extraParams);
    return url + (url.charAt(url.length-1) !== "?" ? "?" : "")
            + params.join("&") + ((extra.length > 0) ? "&" + extra : "");
}

/**
 * Returns a 'GetCoverage' request URL with parameters encoded as KVP.
 *
 * @param url the base URL of the service
 * @param coverage the ID of the coverage
 * @param options an object containing any the following optional parameters
 * @param options.format the desired format of the returned coverage
 * @param options.bbox an array of four values in the following order:
 *                     [minx, miny, maxx, maxy]
 * @param options.subsetX the subset of the X axis as an array in the following form:
 *                         [minx, maxx]
 * @param options.subsetY the subset of the Y axis as an array in the following form:
 *                         [minx, maxx]
 * @param options.subsetCRS the CRS definition in which the spatial subsets are
 *                          expressed in
 * @param options.rangesubset an array of selected band names or indices
 * @param options.size an array of two size values limiting the size for both axes
 * @param options.sizeX the size of the X axis
 * @param options.sizeY the size of the Y axis
 * @param options.resolution an array of two resolution values specifying the
 *                           resolution for both axes
 * @param options.resolutionX the resolution of the X axis
 * @param options.resolutionY the resolution of the Y axis
 * @param options.interpolation the interpolation method as advertised by the service
 * @param options.outputCRS the CRS definition in which the coverage shall be returned
 * @param options.multipart if set to true, the coverage will be returned with
 *                          according XML metadata
 *
 * @param extraParams an object containing any extra (vendor specific)
 *                    parameters which will be appended to the query string
 *
 * @returns the constructed request URL
 */

function getCoverageURL(url, coverageid, options, extraParams) {
    if (!url || !coverageid) {
        throw new Error("Parameters 'url' and 'coverageid' are mandatory.");
    }
    options = options || {};
    var subsetCRS = options.subsetCRS || "http://www.opengis.net/def/crs/EPSG/0/4326";
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

    var extra = utils.objectToKVP(extraParams);
    return url + (url.charAt(url.length-1) !== "?" ? "?" : "")
            + params.join("&") + ((extra.length > 0) ? "&" + extra : "");
}

module.exports = {
    getCapabilitiesURL: getCapabilitiesURL,
    describeCoverageURL: describeCoverageURL,
    getCoverageURL: getCoverageURL
}