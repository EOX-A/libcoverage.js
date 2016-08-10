/**
 * @module eowcs/parse
 */

'use strict';

var utils = require("../utils");
var coreParse = require("../parse");


var ns = {
    wcs: "http://www.opengis.net/wcs/2.0",
    gml: "http://www.opengis.net/gml/3.2",
    gmlcov: "http://www.opengis.net/gmlcov/1.0",
    eop: "http://www.opengis.net/eop/2.0",
    wcseo: "http://www.opengis.net/wcs/wcseo/1.0",
    wcseoold: "http://www.opengis.net/wcseo/1.0",  // support old definitions aswell
    om: "http://www.opengis.net/om/2.0"
}

var xPath = utils.createXPath(ns);

var xPathArray = utils.createXPathArray(ns);


function parseEOCoverageSetDescription(node) {
    var covDescriptions = xPath(node, "wcs:CoverageDescriptions");
    var cdescs = (covDescriptions != null) ? coreParse.callParseFunctions(
        "CoverageDescriptions", covDescriptions
    ) : [];

    var dssDescriptions = xPath(node, "wcseo:DatasetSeriesDescriptions");
    var dssdescs = (dssDescriptions != null) ? coreParse.callParseFunctions(
        "DatasetSeriesDescriptions", dssDescriptions
    ) : [];

    return {
        "coverageDescriptions": cdescs.coverageDescriptions,
        "datasetSeriesDescriptions": dssdescs.datasetSeriesDescriptions
    };
}

function parseDatasetSeriesDescriptions(node) {
    var descs = utils.map(xPathArray(node, "wcseo:DatasetSeriesDescription|wcseoold:DatasetSeriesDescription"), function(datasetSeriesDescription) {
        return coreParse.callParseFunctions("DatasetSeriesDescription", datasetSeriesDescription);
    });

    return {datasetSeriesDescriptions: descs};
}

function parseDatasetSeriesDescription(node) {
    return {
        "datasetSeriesId": xPath(node, "wcseo:DatasetSeriesId/text()|wcseoold:DatasetSeriesId/text()"),
        "timePeriod": [
            new Date(xPath(node, "gml:TimePeriod/gml:beginPosition/text()")),
            new Date(xPath(node, "gml:TimePeriod/gml:endPosition/text()"))
        ]
    };
}

function parseExtendedCapabilities(node) {
    return {
        "contents": {
            "datasetSeries": utils.map(xPathArray(node, "wcs:Contents/wcs:Extension/wcseo:DatasetSeriesSummary|wcs:Contents/wcs:Extension/wcseoold:DatasetSeriesSummary"), function(sum) {
              return coreParse.callParseFunctions("DatasetSeriesDescription", sum);
            })
        }
    };
}

function parseExtendedCoverageDescription(node) {
    var eoMetadata = xPath(node, "gmlcov:metadata/gmlcov:Extension/wcseo:EOMetadata|gmlcov:metadata/wcseo:EOMetadata|gmlcov:metadata/gmlcov:Extension/wcseoold:EOMetadata|gmlcov:metadata/wcseoold:EOMetadata");
    if (eoMetadata) {
        var phenomenonTime = xPath(eoMetadata, "eop:EarthObservation/om:phenomenonTime");
        return {
            "footprint": utils.stringToFloatArray(xPath(eoMetadata, "eop:EarthObservation/om:featureOfInterest/eop:Footprint/eop:multiExtentOf/gml:MultiSurface/gml:surfaceMember/gml:Polygon/gml:exterior/gml:LinearRing/gml:posList/text()")),
            "timePeriod": [
                new Date(xPath(phenomenonTime, "gml:TimePeriod/gml:beginPosition/text()")),
                new Date(xPath(phenomenonTime, "gml:TimePeriod/gml:endPosition/text()"))
            ]
        };
    }
    else return {};
}

var parseFunctions = {
    "EOCoverageSetDescription": parseEOCoverageSetDescription,
    "DatasetSeriesDescriptions": parseDatasetSeriesDescriptions,
    "DatasetSeriesDescription": parseDatasetSeriesDescription,
    "Capabilities": parseExtendedCapabilities,
    "CoverageDescription": parseExtendedCoverageDescription
};

module.exports = {
    parseFunctions: parseFunctions
}
