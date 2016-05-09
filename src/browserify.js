var WCS = window.WCS = window.WCS || {};

WCS.Utils = require("./utils");

WCS.Core = WCS.Core || {};
WCS.Core.Parse = require("./parse");
WCS.Core.KVP = require("./kvp");

WCS.EO = WCS.EO || {};
WCS.EO.KVP = require("./eowcs/kvp");

WCS.Core.Parse.pushParseFunctions(require("./eowcs/parse").parseFunctions);
