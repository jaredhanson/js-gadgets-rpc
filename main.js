/**
 * gadgets.rpc
 *
 * This module implements the gadgets.rpc API defined by OpenSocial.
 *
 * References:
 *  - [OpenSocial](http://opensocial.org/)
 *  - [OpenSocial](http://en.wikipedia.org/wiki/OpenSocial)
 *  - [rpc.js](https://svn.apache.org/repos/asf/shindig/tags/shindig-project-2.0.0/features/src/main/javascript/features/rpc/rpc.js)
 *
 *  - [Gadgets API](https://developers.google.com/gadgets/)
 *  - [Gadgets Specification](https://developers.google.com/gadgets/docs/spec)
 *  - [Static Class gadgets.rpc](https://developers.google.com/gadgets/docs/reference/#gadgets.rpc)
 *  - [rpc.js](http://opensocial-resources.googlecode.com/svn/spec/0.8/gadgets/rpc.js)
 */
define(['exports',
        'gadgets.util',
        './lib/transports'],
function(exports, util, transports) {

  var relayUrl = {}
    , useLegacyProtocol = {}
    , authToken = {};

  exports.register = function(serviceName, handler) {
    console.log('gadgets.rpc.register');
    console.log('  serviceName: ' + serviceName);
  }
  
  exports.setRelayUrl = function(targetId, url, useLegacy) {
    console.log('gadgets.rpc.setRelayUrl');
    console.log('  targetId: ' + targetId);
    
    if (!/http(s)?:\/\/.+/.test(url)) {
      if (url.indexOf("//") == 0) {
        url = window.location.protocol + url;
      } else if (url.charAt(0) == '/') {
        url = window.location.protocol + "//" + window.location.host + url;
      } else if (url.indexOf("://") == -1) {
        // Assumed to be schemaless. Default to current protocol.
        url = window.location.protocol + "//" + url;
      }
    }
    relayUrl[targetId] = url;
    useLegacyProtocol[targetId] = !!useLegacy;
  }
  
  exports.setAuthToken = function(targetId, token, forceSecure) {
    console.log('gadgets.rpc.setAuthToken');
    console.log('  targetId: ' + targetId);
    console.log('  token: ' + token);
    
    
    token = token || '';
    authToken[targetId] = String(token);
    // TODO:
    //setupFrame(targetId, token, forcesecure);
  }
  
  exports.setupReceiver = function(targetId, url, authToken, forceSecure) {
    setupChildIframe(targetId, url, authToken, forceSecure)
  }
  
  exports.getAuthToken = function(targetId) {
    console.log('gadgets.rpc.getAuthToken');
    console.log('  targetId: ' + targetId);
    
    return authToken[targetId];
  }
  
  function setupChildIframe(targetId, url, authToken, forceSecure) {
    var iframe = document.getElementById(targetId);
    if (!iframe) {
      throw new Error("Cannot set up gadgets.rpc receiver with ID: " + targetId + ". Element not found.");
    }
    
    // The "relay URL" can be explicitly specified, defaulting to the IFRAME
    // source.
    var relayUrl = url || iframe.src;
    exports.setRelayUrl(targetId, relayUrl);

    // The auth token is parsed from URL params (rpctoken) or overridden.
    var params = util.getUrlParameters(iframe.src);
    var rpctoken = authToken || params.rpctoken;
    var forcesecure = forceSecure || params.forcesecure;
    exports.setAuthToken(targetId, rpctoken, forcesecure);
  }
  
  
  exports.getOrigin = function(url) {
    if (!url) {
      return "";
    }
    url = url.toLowerCase();
    if (url.indexOf("//") == 0) {
      url = window.location.protocol + url;
    }
    if (url.indexOf("://") == -1) {
      // Assumed to be schemaless. Default to current protocol.
      url = window.location.protocol + "//" + url;
    }
    // At this point we guarantee that "://" is in the URL and defines
    // current protocol. Skip past this to search for host:port.
    var host = url.substring(url.indexOf("://") + 3);

    // Find the first slash char, delimiting the host:port.
    var slashPos = host.indexOf("/");
    if (slashPos != -1) {
      host = host.substring(0, slashPos);
    }

    var protocol = url.substring(0, url.indexOf("://"));

    // Use port only if it's not default for the protocol.
    var portStr = "";
    var portPos = host.indexOf(":");
    if (portPos != -1) {
      var port = host.substring(portPos + 1);
      host = host.substring(0, portPos);
      if ((protocol === "http" && port !== "80") ||
          (protocol === "https" && port !== "443")) {
        portStr = ":" + port;
      }
    }

    // Return <protocol>://<host>[<port>]
    return protocol + "://" + host + portStr;
  }
  
  
  
  var transport = transports.get();
  
  function transportReady(receiverId, readySuccess) {
    console.log('transportReady');
  }
  
  function process(rpc) {
    console.log('process');
  }
  
  function init() {
    transport.init(process, transportReady);
  }
  init();
});
