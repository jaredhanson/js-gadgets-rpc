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
        './lib/transports'],
function(exports, transports) {

  var authToken = {};

  exports.register = function(serviceName, handler) {
    console.log('gadgets.rpc.register');
    console.log('  serviceName: ' + serviceName);
  }
  
  exports.getAuthToken = function(targetId) {
    console.log('gadgets.rpc.getAuthToken');
    console.log('  targetId: ' + targetId);
    
    return authToken[targetId];
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
