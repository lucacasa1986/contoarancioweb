//Install express server
const express = require('express');
const app = express();
var proxy = require('express-http-proxy');

 
app.use('/api', proxy('https://lucacasa1986.pythonanywhere.com/api'));
// Serve only the static files form the dist directory
app.use(express.static(__dirname + '/dist'));

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080);
