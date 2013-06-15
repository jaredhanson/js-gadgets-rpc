define(['exports', 'postmessage'],
function(exports, pm) {
  
  var listener
    , isForceSecure = false;
  
  function init(processFn, readyFn) {
    console.log('wpm.init');
    
    listener = pm.createListener(function(data, origin, source) {
      console.log('*** GOT MESSAGE: ');
      console.log(data);
      console.log('ORIGIN: ' + origin);
      //console.log('SOURCE: ' + source);
      
      
      try {
        var rpc = JSON.parse(data);
      } catch (_) {
        return;
      }
      
      console.log(rpc);
      
      if (isForceSecure) {
        if (!rpc || !rpc.f) {
          return;
        }
        
        // TODO: Implement this.
      }
      processFn(rpc);
    });
    listener.listen();
  }
  
  function setup(receiverId, token, forceSecure) {
    console.log('wpm.setup');
    console.log('  receiverId: ' + receiverId);
    console.log('  token: ' + token);
    console.log('  forceSecure: ' + forceSecure);
    
    isForceSecure = forceSecure;
    // If we're a gadget, send an ACK message to indicate to container
    // that we're ready to receive messages.
    if (receiverId === '..') {
      // TODO: Implement this.
      if (isForceSecure) {
        //gadgets.rpc._createRelayIframe(token);
      } else {
        // TODO:
        //gadgets.rpc.call(receiverId, gadgets.rpc.ACK);
      }
    }
    return true;
  }
  
  exports.init = init;
  exports.setup = setup;
  
});
