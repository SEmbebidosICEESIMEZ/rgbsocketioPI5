var http = require('http').createServer(handler); //require http server, and create server with function handler()
var fs = require('fs'); //require filesystem module
var io = require('socket.io')(http) //require socket.io module and pass the http object (server)
const gpio = require("@iiot2k/gpiox");

const ledRed = 22;
const ledGreen = 17;
const ledBlue = 27;

const PWM_FREQ = 200; // Hz
const PWM_DUTY_INIT = 0; // %

gpio.init_pwm(ledRed, gpio.GPIO_MODE_PWM, PWM_FREQ, PWM_DUTY_INIT);
gpio.init_pwm(ledGreen, gpio.GPIO_MODE_PWM, PWM_FREQ, PWM_DUTY_INIT);
gpio.init_pwm(ledBlue, gpio.GPIO_MODE_PWM, PWM_FREQ, PWM_DUTY_INIT);

redRGB = 0, //set starting value of RED variable to off (0 for common cathode)
greenRGB = 0, //set starting value of GREEN variable to off (0 for common cathode)
blueRGB = 0; //set starting value of BLUE variable to off (0 for common cathode)


http.listen(8080); //listen to port 8080

function scaleTo100(value) {
  return Math.round((value / 255) * 100);
}

function handler (req, res) { //what to do on requests to port 8080
  fs.readFile(__dirname + '/public/rgb.html', function(err, data) { //read file rgb.html in public folder
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/html'}); //display 404 on error
      return res.end("404 Not Found");
    }
    res.writeHead(200, {'Content-Type': 'text/html'}); //write HTML
    res.write(data); //write data from rgb.html
    return res.end();
  });
}

io.sockets.on('connection', function (socket) {// Web Socket Connection
    socket.on('rgbLed', function(data) { //get light switch status from client
      console.log(data); //output data from WebSocket connection to console
  
      //for common cathode RGB LED 0 is fully off, and 255 is fully on
      redRGB=parseInt(data.red);
      greenRGB=parseInt(data.green);
      blueRGB=parseInt(data.blue);
      let redScaled = scaleTo100(redRGB);
      let greenScaled = scaleTo100(greenRGB);
      let blueScaled = scaleTo100(blueRGB);
  
      gpio.set_pwm(ledRed, PWM_FREQ, redScaled);
      gpio.set_pwm(ledGreen, PWM_FREQ, greenScaled);
      gpio.set_pwm(ledBlue, PWM_FREQ, blueScaled);
    });
  });
  
  process.on('SIGINT', function () { //on ctrl+c
    gpio.deinit_gpio(ledRed);
    gpio.deinit_gpio(ledGreen);
    gpio.deinit_gpio(ledBlue);
    process.exit(); //exit completely
  });