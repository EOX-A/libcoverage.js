libcoverage.js
==============

Libcoverage.js is an extensible client library for the `Open Geospatial
Constortium (OGC) <http://www.opengeospatial.org/>`_ `Web Coverage Service
2.0+ interface standard <http://www.opengeospatial.org/standards/wcs>`_ using
a MIT style license.

It features means to create requests from parameters and parse the results
returned from a WCS service.

Dependencies:

  - jQuery (or any other similar ($) - DOM library): for parsing XML documents
    to JavaScript objects. **Attention:** It must be capable of namespace-aware
    selecting XML elements using the CSS namespace rules (e.g:
    ```$node.find("wcs|ServiceMetadata");```).
    A good implementation for namespace aware selecting can be found `here
    <www.rfk.id.au/blog/entry/xmlns-selectors-jquery/>`_. 

Drawbacks:

  - Libcoverage.js does *not* send and receive requests of any kind. This was
    designed with the intention to maximize compatibility with other DOM/ajax
    libraries. Since jQuery (or a similar library) is already a dependency, the
    included `ajax function <http://api.jquery.com/jQuery.ajax/>`_ can be used
    to dispatch the generated requests and react to the responses.
    Otherwise, the `XMLHttpRequest <http://www.w3.org/TR/XMLHttpRequest/>`_
    method is also legitimate.

  - Responses can only be parsed in a general way with the
    ``WCS.Core.Parse.parse`` function.
  

Libcoverage.js uses namespaces to not clutter the global one.

Request Generation
------------------

Lying in the ``WCS.*.KVP`` directories the functions ending with ``...URL``
are creating request URLs for the available request methods. For the WCS
2.0 core, these are:

- GetCapabilities (``WCS.Core.getCapabilitiesURL``): This request gathers
  general information about the consumed service, e.g: allowed requests,
  available coverages and various service metadata.

- DescribeCoverage (``WCS.Core.describeCoverageURL``): This request collects
  detailed information about one or more coverages.

- GetCoverage (``WCS.Core.getCoverageURL``): This request downloads a specific
  coverage or subsets thereof and applies certain pre-processing parameters
  (e.g: reprojection or band-selection).

The generated requests can be sent to the server via the transmission method of
any flavor but typically via ajax.

Response Parsing
----------------

To parse the responses returned by the service use the ``WCS.Core.Parse.parse``
function. It tries to find the correct parsing functions for the given element
name and returns a merged object, containing the result of all registered
parsing functions. This approach was taken for the sake of extensibility,
please refer to the chapter `Extending libcoverage.js`_ for the exact means.

Extending libcoverage.js
------------------------

Since WCS 2.0 uses a `Core/Extension approach
<https://portal.opengeospatial.org/files/?artifact_id=46442>`_ it is vital for
a client library to be extensible to easily adapt new extensions. This is
mostly important for parsing service responses.

Libcoverage.js allows the registration of new parsing functions for the node
name of the elements it shall parse. As explained in `Response Parsing`_ the
results of all registered functions are deep-merged together, so the extending
parse functions should only parse information not yet included in the main
parsing result.

Example: EO-WCS
```````````````

Libcoverage.js ships with a client extension for `Earth Observation (EO-WCS)
<https://portal.opengeospatial.org/files/?artifact_id=45404>`_. It provides a
new function for generating requests (``WCS.EO.KVP.describeEOCoverageSetURL``)
and new element parsing functions for ``Capabilities``, ``CoverageDescriptions``
and ``EOCoverageSetDescriptions`` which are registered once the module is
loaded.

The extended ``Capabilities`` parse function extends the parsed object with
additional information about advertised dataset series. The
``CoverageDescriptions`` objects, on the other hand, are extended by the time
interval and the footprint.

Integrations
------------

Currently there is only one integration, namely for MVC framework `Backbone
<http://documentcloud.github.com/backbone/>`_. The integration provides the
models ``Service`` and ``Coverage`` and the collection ``CoverageSet``. If the
EO-WCS extension for libcoverage.js is also available, then the EOCoverageSet
is included aswell. The models integrate seamlessly within Backbone and can be
used alongside other models and object synchronization.

Unfortunately, as with the current status of `Web Coverage Service -
Transactional (WCS-T)
<http://portal.opengeospatial.org/files/?artifact_id=17909>`_ it is not
possible to integrate creation or modification of coverages within backbone and
thus all related function calls will fail. This may change once the
transactional interface extension for WCS 2.0 is specified.

References
----------

- `EOxServer Webclient <http://eoxserver.org/doc/en/users/webclient.html>`_
