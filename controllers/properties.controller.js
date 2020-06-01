'use strict';
const Property = require('../models/property.model');
const AbstractController = require('./abstract');

module.exports = class PropertyController extends AbstractController{
    constructor(){
    	super();
    	this.model = Property;
    }
}