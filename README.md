# libcoverage.js

Libcoverage.js is an extensible client library for the
[Open Geospatial Constortium (OGC)](http://www.opengeospatial.org/)
[Web Coverage Service 2.0+ interface standard](http://www.opengeospatial.org/standards/wcs)
using a MIT style license.

It features means to create requests from parameters and parse the results
returned from a WCS service.

## Installation

You can use libcoverage.js either via npm:

```bash
npm install libcoverage
```

Or as a pre-bundled package:

```html
<script src="path/to/libcoverage.min.js"></script>
```


## Usage

**Loading the modules** (When not using the pre-bundled Version)

```javascript
var parse = require("libcoverage/src/parse");
var kvp = require("libcoverage/src/kvp");
var eoParse = require("libcoverage/src/eowcs/parse");
var eoKvp = require("libcoverage/src/eowcs/parse");
```

**Installing EO-WCS parsing extensions**

```javascript
parse.pushParseFunctions(eoPparse.parseFunctions);
```

**Creating a GetCapabilities KVP request**

```javascript
var url = kvp.getCapabilitiesURL(baseUrl, {
  updatesequence: "someupdatesequence",
  sections: ["ServiceIdentification", "Contents"]
});
```

**Creating a DescribeCoverage KVP request**

```javascript
var url = kvp.describeCoverageURL(baseUrl, [
  "coverageA", "coverageB"
]);
```

**Creating a GetCoverage KVP request**

```javascript
var url = kvp.getCoverageURL(baseUrl, "coverageId", {
  format: "image/tiff",
  subsetX: [3.15, 3.25],
  subsetY: [22.28, 23.00],
  size: [100, 700],
  interpolation: "nearest"
});
```

**Full GetCapabilities round-trip**

```javascript
var xhr = new XMLHttpRequest();
xhr.open('GET', kvp.getCapabilitiesURL(baseUrl), true);
xhr.onload = function(e) {
  var capabilities = parse.parse(this.response);
  console.log(capabilities);
}
xhr.send();
```

For compatibility reasons, the pre-bundled version of libcoverage.js exports a
``WCS`` object object in the global scope (the ``window``) with the following
sub-elements, mapping to the respective modules:

 * ``WCS.Util`` -> ``utils.js``
 * ``WCS.Core.Parse`` -> ``parse.js``
 * ``WCS.Core.KVP`` -> ``kvp.js``
 * ``WCS.EO.Parse`` -> ``eowcs/parse.js``
 * ``WCS.EO.KVP`` -> ``eowcs/kvp.js``

To get a complete picture of all available functions and parameters, please refer
to the [API docs](http://eox-a.github.io/libcoverage.js/).

> _Note_: libcoverage.js does not have any further dependency but relies on the
> [XPath API](https://developer.mozilla.org/en/docs/Web/API/Document/evaluate),
> and thus needs a browser that correctly supports it.

## Extending libcoverage.js

Since WCS 2.0 uses a [Core/Extension approach](https://portal.opengeospatial.org/files/?artifact_id=46442)
it is vital for a client library to be extensible to easily adapt new extensions.
This is mostly important for parsing service responses.

Libcoverage.js allows the registration of new parsing functions for the node
name of the elements it shall parse. The results of all registered functions
for the same tag are deep-merged together, so the extending parse functions
should only parse information not yet included in the main parsing result.

To extend the core parsing capabilities with some specific functionality, one
first has to design the parsing function which always takes the XML DOM node as
parameter:

```javascript
var parseExtendedCapabilities = function(node) {
    return {
        // parse data and insert it here
        specialData: someFinder(node, "SomePath").text
    }
}
```

Then, the function has to be registered for the node name (without the
namespace prefix):

```javascript
WCS.Core.Parse.pushParseFunction("Capabilities", parseExtendedCapabilities);
```

### Example extension: EO-WCS

Libcoverage.js ships with a client extension for
[Earth Observation (EO-WCS)](https://portal.opengeospatial.org/files/?artifact_id=45404).
It provides a new function for generating requests
(``WCS.EO.KVP.describeEOCoverageSetURL``) and new element parsing functions for
``Capabilities``, ``CoverageDescriptions`` and ``EOCoverageSetDescriptions`` 
which are registered once the module is loaded.

The extended ``Capabilities`` parse function extends the parsed object with
additional information about advertised dataset series. The
``CoverageDescriptions`` objects, on the other hand, are extended by the time
interval and the footprint.

## Integrations

Currently there is only one integration, namely for the MVC framework
[Backbone](http://backbonejs.org/). The integration provides the
models ``Service`` and ``Coverage`` and the collection ``CoverageSet``. If the
EO-WCS extension for libcoverage.js is also available, then the EOCoverageSet
is included aswell. The models integrate seamlessly within Backbone and can be
used alongside other models and object synchronization.

Unfortunately, as with the current status of
[Web Coverage Service - Transactional (WCS-T)](http://portal.opengeospatial.org/files/?artifact_id=17909)
it is not possible to integrate creation or modification of coverages within
backbone and thus all related function calls will fail. This may change once the
transactional interface extension for WCS 2.0 is specified.

## References

- [EOxServer Webclient](https://eoxserver.readthedocs.io/en/stable/users/webclient.html)
