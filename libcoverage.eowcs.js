namespace("WCS.EO");

/**
 *  function WCS.EO.describeEOCoverageSetURL
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

WCS.EO.describeEOCoverageSetURL = function(url, eoid, options, extraParams) {
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


/* push EO-WCS related parse functions */
WCS.Core.pushParseFunctions({
    "EOCoverageSetDescription": WCS.EO.parseEOCoverageSetDescription,
    "DatasetSeriesDescription": WCS.EO.parseDatasetSeriesDescription,
});

WCS.EO.parseEOCoverageSetDescription = function($node) {
    
};

WCS.EO.parseDatasetSeriesDescription = function($node) {
    
};
