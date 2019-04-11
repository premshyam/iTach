var Webserver = require('./webserver/webserver.js');

// top level function starting appropriate webserver
function Main() {

  // Set the IP address
  ip_address = 'localhost';//localhost
  // Start a webserver
  this.webserver = new Webserver(ip_address);

}

// start the main 
var Main = new Main();
