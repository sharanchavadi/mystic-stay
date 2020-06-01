'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var app = express();

const property = require('./routes/property.route');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/travel_nomad');

mongoose.Promise = global.Promise;

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/properties', property);

var port = 3000;

app.listen(port, () => {
    console.log('Server is up and running on port number ' + port);
});
