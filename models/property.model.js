'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let PropertySchema = new Schema({
    name: {type: String, required: true},
    description: {type: String, required: true},
    price: {type: Number, required: true},
    address: {type: String, required: true},
    latitude: {type: Number, required: true},
    longitude: {type: Number, required: true},
    rules: {type: String},
    minimum_days: {type: Number}  
});


module.exports = mongoose.model('Property', PropertySchema);