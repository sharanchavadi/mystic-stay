'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let AmenitySchema = new Schema({
    name: {type: String, required: true},
    description: {type: String, required: true}  
});


module.exports = mongoose.model('Amenity', AmenitySchema);