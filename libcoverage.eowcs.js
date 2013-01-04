namespace("WCS.EO");

/**
 *  module WCS.EO.KVP
 *
 *
 */

WCS.EO.KVP = function() {

    return { /// begin public functions
    
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

    describeEOCoverageSetURL: function(url, eoid, options, extraParams) {
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
            params.push('subset=y,' + subsetCRS + '(' + options.subsetY[0] + ',' + options.subsetY[1] + ')');
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
    }

    } /// end public functions
} ();


/**
 *  module WCS.EO.Parse
 *
 *
 */

WCS.EO.Parse = function() {

    /// begin private fields

    var ns = {
        wcs: "http://www.opengis.net/wcs/2.0",
        gml: "http://www.opengis.net/gml/3.2",
        eop: "http://www.opengis.net/eop/2.0",
        wcseo: "http://www.opengis.net/wcseo/1.0",
        om: "http://www.opengis.net/om/2.0"
    }

    var getFirst = WCS.Util.getFirst,
        getText = WCS.Util.getText,
        getAll = WCS.Util.getAll,
        getTextArray = WCS.Util.getTextArray,
        map = WCS.Util.map;

    /// end private fields

    return { /// begin public functions
    
    parseEOCoverageSetDescription: function(node) {
        var covDescriptions = getFirst(node, ns.wcs, "CoverageDescriptions");
        var cdescs = covDescriptions ? WCS.Core.Parse.callParseFunctions(
            "CoverageDescriptions", covDescriptions
        ) : [];

        var dssDescriptions = getFirst(node, ns.wcseo, "DatasetSeriesDescriptions");
        var dssdescs = (dssDescriptions) ? WCS.Core.Parse.callParseFunctions(
            "DatasetSeriesDescriptions", dssDescriptions
        ) : [];

        return {
            "coverageDescriptions": cdescs.coverageDescriptions,
            "datasetSeriesDescriptions": dssdescs.datasetSeriesDescriptions
        };
    },

    parseDatasetSeriesDescriptions: function(node) {
        var descs = map(getAll(node, ns.wcseo, "DatasetSeriesDescription"), function(datasetSeriesDescription) {
            return WCS.Core.Parse.callParseFunctions("DatasetSeriesDescription", datasetSeriesDescription);
        });

        return {datasetSeriesDescriptions: descs};
    },

    parseDatasetSeriesDescription: function(node) {
        return {}; // TODO: implement
    },

    parseExtendedCapabilities: function(node) {
        return {
            "contents": {
                "datasetSeries": map(getAll(node, ns.wcseo, "DatasetSeriesSummary"), function(sum) {
                    return {
                        "datasetSeriesId": getText(sum, ns.wcseo, "DatasetSeriesId"),
                        "timePeriod": [
                            new Date(getText(sum, ns.gml, "beginPosition")),
                            new Date(getText(sum, ns.gml, "endPosition"))
                        ]
                    };
                })
            }
        };
    },

    parseExtendedCoverageDescription: function(node) {
        var eoMetadata = getFirst(node, ns.wcseo, "EOMetadata");
        if (eoMetadata) {
            var phenomenonTime = getFirst(eoMetadata, ns.om, "phenomenonTime");
            var featureOfInterest = getFirst(eoMetadata, ns.om, "featureOfInterest");
            return {
                "footprint": WCS.Util.stringToFloatArray(getText(featureOfInterest, ns.gml, "posList")),
                "timePeriod": [
                    new Date(getText(phenomenonTime, ns.gml, "beginPosition")),
                    new Date(getText(phenomenonTime, ns.gml, "endPosition"))
                ]
            };
        }
        else return {};
    }

    } /// end public functions
} ();


/* push EO-WCS related parse functions */
WCS.Core.Parse.pushParseFunctions({
    "EOCoverageSetDescription": WCS.EO.Parse.parseEOCoverageSetDescription,
    "DatasetSeriesDescriptions": WCS.EO.Parse.parseDatasetSeriesDescriptions,
    "DatasetSeriesDescription": WCS.EO.Parse.parseDatasetSeriesDescription,
    "Capabilities": WCS.EO.Parse.parseExtendedCapabilities,
    "CoverageDescription": WCS.EO.Parse.parseExtendedCoverageDescription
});
