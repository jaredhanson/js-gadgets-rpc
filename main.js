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

  var CALLBACK_NAME = '__cb';
  var DEFAULT_NAME = '';
  var ACK = '__ack';

  var SETUP_FRAME_TIMEOUT = 500;
  var SETUP_FRAME_MAX_TRIES = 10;

  var services = {}
    , relayUrl = {}
    , useLegacyProtocol = {}
    , authToken = {}
    , setup = {};

  function register(serviceName, handler) {
    console.log('gadgets.rpc.register');
    console.log('  serviceName: ' + serviceName);
    
    if (serviceName === CALLBACK_NAME || serviceName === ACK) {
      throw new Error("Cannot overwrite callback/ack service");
    }

    if (serviceName === DEFAULT_NAME) {
      throw new Error("Cannot overwrite default service:"
                      + " use registerDefault");
    }

    services[serviceName] = handler;
  }
  
  function unregister(serviceName) {
    console.log('gadgets.rpc.unregister');
    console.log('  serviceName: ' + serviceName);
    
    if (serviceName === CALLBACK_NAME || serviceName === ACK) {
      throw new Error("Cannot delete callback/ack service");
    }

    if (serviceName === DEFAULT_NAME) {
      throw new Error("Cannot delete default service:"
                      + " use unregisterDefault");
    }

    delete services[serviceName];
  }
  
  function setRelayUrl(targetId, url, useLegacy) {
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
  
  function setAuthToken(targetId, token, forceSecure) {
    console.log('gadgets.rpc.setAuthToken');
    console.log('  targetId: ' + targetId);
    console.log('  token: ' + token);
    
    
    token = token || '';
    authToken[targetId] = String(token);
    
    setupFrame(targetId, token, forceSecure);
  }
  
  function setupReceiver(targetId, url, authToken, forceSecure) {
    setupChildIframe(targetId, url, authToken, forceSecure)
  }
  
  function getAuthToken(targetId) {
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
    setRelayUrl(targetId, relayUrl);

    // The auth token is parsed from URL params (rpctoken) or overridden.
    var params = util.getUrlParameters(iframe.src);
    var rpctoken = authToken || params.rpctoken;
    var forcesecure = forceSecure || params.forcesecure;
    setAuthToken(targetId, rpctoken, forcesecure);
  }
  
  
  function getOrigin(url) {
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
  
  services[DEFAULT_NAME] = function() {
    console.log('WARNING: Unknown RPC service: ' + this.s);
    //gadgets.warn('Unknown RPC service: ' + this.s);
  };
  
  function setupFrame(frameId, token, forcesecure) {
    if (setup[frameId] === true) {
      return;
    }

    if (typeof setup[frameId] === 'undefined') {
      setup[frameId] = 0;
    }

    var tgtFrame = document.getElementById(frameId);
    if (frameId === '..' || tgtFrame != null) {
      if (transport.setup(frameId, token, forcesecure) === true) {
        setup[frameId] = true;
        return;
      }
    }

    if (setup[frameId] !== true && setup[frameId]++ < SETUP_FRAME_MAX_TRIES) {
      // Try again in a bit, assuming that frame will soon exist.
      window.setTimeout(function() { setupFrame(frameId, token, forcesecure) },
                        SETUP_FRAME_TIMEOUT);
    } else {
      // TODO: Implement this.
      // Fail: fall back for this gadget.
      //receiverTx[frameId] = fallbackTransport;
      //setup[frameId] = true;
    }
  }
  
  function transportReady(receiverId, readySuccess) {
    console.log('transportReady');
  }
  
  function process(rpc) {
    //
    // RPC object contents:
    //   s: Service Name
    //   f: From
    //   c: The callback ID or 0 if none.
    //   a: The arguments for this RPC call.
    //   t: The authentication token.
    //
    if (rpc && typeof rpc.s === 'string' && typeof rpc.f === 'string' &&
        rpc.a instanceof Array) {

      // Validate auth token.
      if (authToken[rpc.f]) {
        // We don't do type coercion here because all entries in the authToken
        // object are strings, as are all url params. See setupReceiver(...).
        if (authToken[rpc.f] !== rpc.t) {
          console.log('ERROR: Invalid auth token.');
          // TODO:
          //gadgets.error("Invalid auth token. " + authToken[rpc.f] + " vs " + rpc.t);
          //securityCallback(rpc.f, FORGED_MSG);
        }
      }

      if (rpc.s === ACK) {
        // Acknowledgement API, used to indicate a receiver is ready.
        window.setTimeout(function() { transportReady(rpc.f, true); }, 0);
        return;
      }

      // If there is a callback for this service, attach a callback function
      // to the rpc context object for asynchronous rpc services.
      //
      // Synchronous rpc request handlers should simply ignore it and return a
      // value as usual.
      // Asynchronous rpc request handlers, on the other hand, should pass its
      // result to this callback function and not return a value on exit.
      //
      // For example, the following rpc handler passes the first parameter back
      // to its rpc client with a one-second delay.
      //
      // function asyncRpcHandler(param) {
      //   var me = this;
      //   setTimeout(function() {
      //     me.callback(param);
      //   }, 1000);
      // }
      if (rpc.c) {
        console.log('TODO: Implement RPC callback.');
        //rpc.callback = function(result) {
        //  gadgets.rpc.call(rpc.f, CALLBACK_NAME, null, rpc.c, result);
        //};
      }

      // Call the requested RPC service.
      var result = (services[rpc.s] ||
                    services[DEFAULT_NAME]).apply(rpc, rpc.a);

      // If the rpc request handler returns a value, immediately pass it back
      // to the callback. Otherwise, do nothing, assuming that the rpc handler
      // will make an asynchronous call later.
      if (rpc.c && typeof result !== 'undefined') {
        console.log('TODO: Send result to RPC call.');
        //gadgets.rpc.call(rpc.f, CALLBACK_NAME, null, rpc.c, result);
      }
    }
  }
  
  function init() {
    transport.init(process, transportReady);
  }
  init();
  
  
  exports.register = register;
  exports.unregister = unregister;
  exports.setRelayUrl = setRelayUrl;
  exports.setAuthToken = setAuthToken;
  exports.setupReceiver = setupReceiver;
  exports.getAuthToken = getAuthToken;
  exports.getOrigin = getOrigin;
  
});
