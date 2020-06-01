'use strict';

const express = require('express');
const router = express.Router();
const PropertiesController = require('../controllers/properties.controller');

let propertyController = new PropertiesController();

router.post('/', (...args) => propertyController.create(...args));

module.exports = router;