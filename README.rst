libcoverage.js
==============

Libcoverage.js is an extensible client library for the `Web Coverage Service
2.0+ interface standard <http://www.opengeospatial.org/standards/wcs>`_.

It features means to create requests from parameters and parse the results
returned from a WCS service.

Dependencies:

  - jQuery (or any other similar ($) - DOM library): for parsing XML documents
  to JavaScript objects. **Attention:** It must be capable of namespace-aware
  selecting XML elements using the CSS namespace rules (e.g:
  ```$node.find("wcs|ServiceMetadata");```).

Drawbacks:

  - Libcoverage.js does *not* send and receive requests of any kind. This was
  designed with the intention to maximize compatibility with other DOM/ajax
  libraries. Since jQuery (or a similar library) is already a dependency, the
  included `ajax function <http://api.jquery.com/jQuery.ajax/>`_ can be used to
  dispatch the generated requests and react to the responses.
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
coverage or subsets thereof and applies certain pre-processing parameters (e.g:
reprojection or band-selection).

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


