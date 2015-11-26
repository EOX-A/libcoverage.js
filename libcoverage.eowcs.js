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
        gmlcov: "http://www.opengis.net/gmlcov/1.0",
        eop: "http://www.opengis.net/eop/2.0",
        wcseo: "http://www.opengis.net/wcs/wcseo/1.0",
        om: "http://www.opengis.net/om/2.0"
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

    var map = WCS.Util.map;

    /// end private fields

    return { /// begin public functions

    parseEOCoverageSetDescription: function(node) {
        var covDescriptions = xPath(node, "wcs:CoverageDescriptions");
        var cdescs = (covDescriptions != null) ? WCS.Core.Parse.callParseFunctions(
            "CoverageDescriptions", covDescriptions
        ) : [];

        var dssDescriptions = xPath(node, "wcseo:DatasetSeriesDescriptions");
        var dssdescs = (dssDescriptions != null) ? WCS.Core.Parse.callParseFunctions(
            "DatasetSeriesDescriptions", dssDescriptions
        ) : [];

        return {
            "coverageDescriptions": cdescs.coverageDescriptions,
            "datasetSeriesDescriptions": dssdescs.datasetSeriesDescriptions
        };
    },

    parseDatasetSeriesDescriptions: function(node) {
        var descs = map(xPathArray(node, "wcseo:DatasetSeriesDescription"), function(datasetSeriesDescription) {
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
                "datasetSeries": map(xPathArray(node, "wcs:Contents/wcs:Extension/wcseo:DatasetSeriesSummary"), function(sum) {
                    return {
                        "datasetSeriesId": xPath(sum, "wcseo:DatasetSeriesId/text()"),
                        "timePeriod": [
                            new Date(xPath(sum, "gml:TimePeriod/gml:beginPosition/text()")),
                            new Date(xPath(sum, "gml:TimePeriod/gml:endPosition/text()"))
                        ]
                    };
                })
            }
        };
    },

    parseExtendedCoverageDescription: function(node) {
        var eoMetadata = xPath(node, "gmlcov:metadata/wcseo:EOMetadata");
        if (eoMetadata) {
            var phenomenonTime = xPath(eoMetadata, "eop:EarthObservation/om:phenomenonTime");
            return {
                "footprint": WCS.Util.stringToFloatArray(xPath(eoMetadata, "eop:EarthObservation/om:featureOfInterest/eop:Footprint/eop:multiExtentOf/gml:MultiSurface/gml:surfaceMember/gml:Polygon/gml:exterior/gml:LinearRing/gml:posList/text()")),
                "timePeriod": [
                    new Date(xPath(phenomenonTime, "gml:TimePeriod/gml:beginPosition/text()")),
                    new Date(xPath(phenomenonTime, "gml:TimePeriod/gml:endPosition/text()"))
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
