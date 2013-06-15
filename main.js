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
