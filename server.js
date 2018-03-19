//Install express server
const express = require('express');
const app = express();
var proxy = require('http-proxy-middleware');

 // Serve only the static files form the dist directory
app.use(express.static(__dirname + '/dist'));
app.use('/api', proxy({target: 'https://lucacasa1986.pythonanywhere.com', changeOrigin: true}));

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080);
