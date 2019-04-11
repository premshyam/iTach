//import packages
var itach = require("itach");
var xmlrpc = require('express-xmlrpc');
var express = require('express');
var http = require('http');

//import winston package (rotating logger)
var winston = require('winston');
require('winston-daily-rotate-file');

var transport = new (winston.transports.DailyRotateFile)({
  filename: './logs/xmlrpc-%DATE%.log',
  datePattern: 'DD-MM-YYYY-HH',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '7d'
});

transport.on('rotate', function (oldFilename, newFilename) {
  // do something fun
});

var logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.json()
  ),
  transports: [
    transport
  ],
});

// Constructor
function Webserver(ip_address) {

  // define the port that the webapp will be hosted on
  port = 5000;

  /* Set up webserver */
  var app = express();
  var server = http.createServer(app);
  server.listen(port, getIPAddress());
  app.use(xmlrpc.bodyParser)
  app.post('/', xmlrpc.apiHandler({
    setstate: function (req, res) {

      //log the arguments
      //        req.body.params.forEach(function(arg) {
      //            console.log(arg);
      //        })
      //device IP
      var deviceIp = req.body.params[0]

      //build command string
      var command = 'setstate,' + req.body.params[1] + ':' + req.body.params[2] + ',' + req.body.params[3] + '\r'
      //log to file 
      logger.info('Received ' + command + ' from DB' + ' for device ' + deviceIp);
      // connect to device 
      this.itach = new itach(deviceIp);
      // response callback
      this.itach.on('response', function (response) {
        // console.log(response);
        logger.info('Received ' + response + ' from device' + deviceIp);
        res.send(xmlrpc.serializeResponse(response))
      });
      // timeout callback
      this.itach.on('timeout', function () {
        // console.log('timeout');
        logger.error('timeout')
        res.send(xmlrpc.serializeFault(1, 'timeout'))
      });
      this.itach.write(command);
      //
    },
    getstate: function (req, res) {
      //log the arguments
      //        req.body.params.forEach(function(arg) {
      //            console.log(arg);
      //        })

      //device IP
      var deviceIp = req.body.params[0]

      //build command string
      var command = 'getstate,' + req.body.params[1] + ':' + req.body.params[2] + '\r'
      //log to file 
      logger.info('Received ' + command + ' from DB' + ' for device ' + deviceIp);
      // connect to device 
      this.itach = new itach(deviceIp);
      // response callback
      this.itach.on('response', function (response) {
        // console.log(response);
        logger.info('Received ' + response + ' from device' + deviceIp);
        res.send(xmlrpc.serializeResponse(response))
      });
      // timeout callback
      this.itach.on('timeout', function () {
        // console.log('timeout');
        logger.error('timeout')
        res.send(xmlrpc.serializeFault(1, 'timeout'))
      });
      this.itach.write(command);
      //
    },
    togglestate: function (req, res) {
      //log the arguments
      //        req.body.params.forEach(function(arg) {
      //            console.log(arg);
      //        })

      //device IP
      var deviceIp = req.body.params[0]

      //build command string
      var command = 'getstate,' + req.body.params[1] + ':' + req.body.params[2] + '\r'
      //log to file 
      logger.info('Received toggle,' + req.body.params[1] + ':' + req.body.params[2] + ' from DB' + ' for device ' + deviceIp);
      // connect to device 
      this.itach = new itach(deviceIp);
      // response callback
      this.itach.on('response', function (response) {
        // console.log(response);
        // console.log(response.split(",")[1])
        // logger.info('Received ' + response + ' from device' + deviceIp);
        //relay address 
        var relayAddress = response.split(",")[1];
        //current state of relay
        var currentState = response.split(",")[2];
        //toggle logic
        if (currentState == 0) {
          currentState = 1;
        }
        else if (currentState == 1) {
          currentState = 0;
        }
        //build command string
        command = 'setstate,' + relayAddress + ',' + currentState + '\r'
        // console.log(command);
        // connect to device 
        this.itach = new itach(deviceIp);
        // response callback
        this.itach.on('response', function (response) {
          // console.log(response);
          logger.info('Received ' + response + ' from device' + deviceIp);
          res.send(xmlrpc.serializeResponse(response))
        });
        // timeout callback
        this.itach.on('timeout', function () {
          // console.log('timeout');
          logger.error('timeout')
          res.send(xmlrpc.serializeFault(1, 'timeout'))
        });
        this.itach.write(command);
        //

      });
      // timeout callback
      this.itach.on('timeout', function () {
        // console.log('timeout');
        logger.error('timeout')
        res.send(xmlrpc.serializeFault(1, 'timeout'))
      });
      this.itach.write(command);
      //
    }
  }))


  // print webserver IP address
  console.log('webserver: Server running on http://' + getIPAddress() + ':' + port);

  //------------------------xmlrpc client-----------------------------------------//
  //    const client = xmlrpc.createClient({ host: getIPAddress(), port: port })
  //    client.methodCall('echo', [{ data: 9001 }], (error, value) => {
  //      console.log(`error: '${error}'`)
  //      console.log(`value: '${JSON.stringify(value)}'`)
  //    })
  //    client.methodCall('Hello', [{ data: 9001 }], (error, value) => {
  //      console.log(`error: '${error}'`)
  //      console.log(`value: '${JSON.stringify(value)}'`)
  //    })
}

//----------------------------------------------------------------------------------------------------------
// getIPAddress()
//    -Input: NULL
//    -Return: IP Address (string)
//
// Get server IP address on LAN
//----------------------------------------------------------------------------------------------------------
function getIPAddress() {
  var interfaces = require('os').networkInterfaces();
  for (var devName in interfaces) {
    var iface = interfaces[devName];
    for (var i = 0; i < iface.length; i++) {
      var alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
        return alias.address;
    }
  }
  return '0.0.0.0';
}


// export the class
module.exports = Webserver;


//         //connect to device
//         var remote = new iTach({
//             host: req.body.params[0] // required: IP address of iTach device
//         });
//         //build command string
//         var command = 'setstate,'+ req.body.params[1] + ':' + req.body.params[2] + ',' + req.body.params[3]
//         logger.info('Received '+ command + ' from DB');
//         // transmit serial command
//         remote.send(command, function callback(err) {
//             if (err) {
//                 throw new Error(err);
//             } else {
//                 // command has been successfully transmitted to your iTach
//             }
//         });