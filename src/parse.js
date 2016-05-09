/**
 * @module parse
 */

'use strict';

var utils = require("./utils");


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
 * @private 
 * @global parseFunctions
 *
 * A hash-table associating the node name of common WCS objects with their
 * according parse function.
 */

var parseFunctions = {};

/**
 * @private
 * namespace declarations
 */

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

var xPath = utils.createXPath(ns);

var xPathArray = utils.createXPathArray(ns);

/**
 * @function pushParseFunction
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

function pushParseFunction(tagName, parseFunction) {
    if (parseFunctions.hasOwnProperty(tagName)) {
        parseFunctions[tagName].push(parseFunction);
    }
    else {
        parseFunctions[tagName] = [parseFunction];
    }
}

/**
 * @function pushParseFunctions
 *
 * Convenience function to push multiple parsing functions at one. The same
 * rules as with `WCS.Core.pushParseFunction` apply here.
 *
 * @params: a hash-table with key-value pairs, where the key is the tag name
 *          and the value the parsing function.
 */

function pushParseFunctions(obj) {
    for (var key in obj) {
        pushParseFunction(key, obj[key]);
    }
}

/**
 * @function callParseFunctions
 *
 * Calls all registered functions for a specified node name. A merged object
 * with all results of each function is returned.
 *
 * @param tagName: the tagName of the node to be parsed
 *
 * @param node: the DOM object
 *
 * @return: the merged object of all parsing results
 */

function callParseFunctions(tagName, node, options) {
    if (parseFunctions.hasOwnProperty(tagName)) {
        var funcs = parseFunctions[tagName],
            endResult = {};
        for (var i = 0; i < funcs.length; ++i) {
            var result = funcs[i](node, options);
            utils.deepMerge(endResult, result);
        }
        return endResult;
    }
    else
        throw new Error("No parsing function for tag name '" + tagName + "' registered.");
}

/**
 * @function parse
 *
 * Parses a (EO-)WCS response to JavaScript objects. 
 *
 * @param xml: the XML string to be parsed
 * @param options: options for parsing
 * @param options.throwOnException: if true, an exception is thrown when an
 *                                  exception report is parsed
 *
 * @returns: depending on the response a JavaScript object with all parsed data
 *           or a collection thereof.
 */

function parse(xml, options) {
    var root;
    if (typeof xml === "string") {
        root = parseXml(xml).documentElement;
    }
    else {
        root = xml.documentElement;
    }
    return callParseFunctions(root.localName, root, options);
}


/**
 * @function parseExceptionReport
 *
 * Parsing function for ows:ExceptionReport elements.
 *
 * @param node: the DOM object
 *
 * @returns: the parsed object
 */

function parseExceptionReport(node, options) {
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
}

/**
 * @function parseCapabilities
 *
 * Parsing function for wcs:Capabilities elements.
 *
 * @param node: the DOM object
 *
 * @returns: the parsed object
 */

function parseCapabilities(node) {
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
}

/**
 * @function parseCoverageDescriptions
 *
 * Parsing function for wcs:CoverageDescriptions elements.
 *
 * @param node: the DOM object
 *
 * @returns: the parsed object
 */

function parseCoverageDescriptions(node) {
    var descs = map(xPathArray(node, "wcs:CoverageDescription"), function(desc) {
        return callParseFunctions(desc.localName, desc);
    });
    return {"coverageDescriptions": descs};
}

/**
 * @function parseCoverageDescription
 *
 * Parsing function for wcs:CoverageDescription elements.
 *
 * @param node: the DOM object
 *
 * @returns: the parsed object
 */

function parseCoverageDescription(node) {
    var low = utils.stringToIntArray(xPath(node, "gml:domainSet/gml:RectifiedGrid/gml:limits/gml:GridEnvelope/gml:low/text()|gml:domainSet/gml:ReferenceableGrid/gml:limits/gml:GridEnvelope/gml:low/text()")),
        high = utils.stringToIntArray(xPath(node, "gml:domainSet/gml:RectifiedGrid/gml:limits/gml:GridEnvelope/gml:high/text()|gml:domainSet/gml:ReferenceableGrid/gml:limits/gml:GridEnvelope/gml:high/text()"));

    var size = [];
    for (var i = 0; i < Math.min(low.length, high.length); ++i) {
        size.push(high[i] + 1 - low[i]);
    }

    var pos = xPath(node, "gml:domainSet/gml:RectifiedGrid/gml:origin/gml:Point/gml:pos/text()");
    if (pos !== "") {
        var origin = utils.stringToFloatArray(pos);
    }
    var offsetVectors = map(xPathArray(node, "gml:domainSet/gml:RectifiedGrid/gml:offsetVector/text()"), function(offsetVector) {
        return utils.stringToFloatArray(offsetVector);
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
            "lower": utils.stringToFloatArray(xPath(node, "gml:boundedBy/gml:Envelope/gml:lowerCorner/text()")),
            "upper": utils.stringToFloatArray(xPath(node, "gml:boundedBy/gml:Envelope/gml:upperCorner/text()"))
        },
        "envelope": {
            "low": low,
            "high": high
        },
        "size": size,
        "origin": origin,
        "offsetVectors": offsetVectors,
        "resolution": resolution,
        "rangeType": utils.map(xPathArray(node, "gmlcov:rangeType/swe:DataRecord/swe:field"), function(field) {
            return {
                "name": field.getAttribute("name"),
                "description": xPath(field, "swe:Quantity/swe:description/text()"),
                "uom": xPath(field, "swe:Quantity/swe:uom/@code"),
                "nilValues": utils.map(xPathArray(field, "swe:Quantity/swe:nilValues/swe:NilValues/swe:nilValue"), function(nilValue) {
                    return {
                        "value": parseInt(nilValue.textContent),
                        "reason": nilValue.getAttribute("reason")
                    }
                }),
                "allowedValues": utils.stringToFloatArray(xPath(field, "swe:Quantity/swe:constraint/swe:AllowedValues/swe:interval/text()")),
                "significantFigures": parseInt(xPath(field, "swe:Quantity/swe:constraint/swe:AllowedValues/swe:significantFigures/text()"))
            };
        }),
        "coverageSubtype": xPath(node, "wcs:ServiceParameters/wcs:CoverageSubtype/text()"),
        "nativeFormat": xPath(node, "wcs:ServiceParameters/wcs:nativeFormat/text()")
    };

    return obj;
}

/* Push core parsing functions */
pushParseFunctions({
    "Capabilities": parseCapabilities,
    "ExceptionReport": parseExceptionReport,
    "CoverageDescriptions": parseCoverageDescriptions,
    "CoverageDescription": parseCoverageDescription,
    "RectifiedGridCoverage": parseCoverageDescription
});


module.exports = {
    pushParseFunction: pushParseFunction,
    pushParseFunctions: pushParseFunctions,
    parse: parse,
    callParseFunctions: callParseFunctions
}
