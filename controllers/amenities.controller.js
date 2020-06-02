'use strict';
const Amenity = require('../models/amenity.model');
const AbstractController = require('./abstract');

module.exports = class AmenityController extends AbstractController{
    constructor(){
    	super();
    	this.model = Amenity;
    }
}