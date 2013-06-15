define(['exports', 'postmessage'],
function(exports, pm) {
  
  var listener
    , isForceSecure = false;
  
  function init(processFn, readyFn) {
    console.log('wpm.init');
    
    listener = pm.createListener(function(data, origin, source) {
      //console.log('*** GOT MESSAGE: ');
      //console.log(data);
      //console.log('ORIGIN: ' + origin);
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
  
  function setup() {
    console.log('wpm.setup');
  }
  
  exports.init = init;
  exports.setup = setup;
  
});
