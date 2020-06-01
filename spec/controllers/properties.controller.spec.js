'use strict';

let PropertyController = require("../../controllers/properties.controller");
let Property = require("../../models/property.model");
let _ = require("lodash");

let mongoose = require('mongoose');
let connection = mongoose.connect('mongodb://localhost/travel_nomad_test');


describe("PropertiesController", () => {
	let res = { send: function() {}};
	beforeEach(() => {
		spyOn(res, 'send').and.stub();
		return mongoose.connection.dropDatabase();
	});
	describe("Create", ()=> {
		it("should create property with all the fields", () => {
			let validData = {
				name: "Paradise",
				description: "Luxury hotel with swimming pools",
				price: 4000,
				latitude: 12334,
				longitude: 3444,
				address: "12, some street, city",
				rules: "Do this and don't do that",
				minimum_days: 2 
			};

			let propertyController = new PropertyController();
			
			let newProperty = {};
			
			return propertyController.create({ body: validData }, res).then(result => {
				expect(res.send).toHaveBeenCalledTimes(1);
				return Property.findOne(validData).then(newProperty => {
					_.each(validData, (validValue, currentKey) => {
						expect(newProperty[currentKey]).toEqual(validValue);
					});
				});
			});

		});

		it("should create property with only the mandatory fields", ()=> {
			let validData = {
				name: "Paradise",
				description: "Luxury hotel with swimming pools",
				price: 4000,
				latitude: 12334,
				longitude: 3444,
				address: "12, some street, city"
			};

			let propertyController = new PropertyController();
			
			let newProperty = {};
			
			return propertyController.create({ body: validData }, res).then(result => {
				return Property.findOne(validData).then(newProperty => {
					_.each(validData, (validValue, currentKey) => {
						expect(newProperty[currentKey]).toEqual(validValue);
					});
				});
			});			
		});


		const mandatoryFields = ["name", "description", "price", "latitude", "longitude", "address"];
		const validData = {
			name: "Paradise",
			description: "Luxury hotel with swimming pools",
			price: 4000,
			latitude: 12334,
			longitude: 3444,
			address: "12, some street, city"
		};
		_.each(mandatoryFields, (field, index) => {
			it(`should not create property if the mandatory field '${field}' is missing`, ()=> {
				let invalidData = Object.assign({}, validData);

				delete invalidData[field];

				let propertyController = new PropertyController();
				
				let newProperty = {};
				
				return propertyController.create({ body: invalidData }, res).then(result => {
					fail("create shouldn't pass");
				}).catch(e => {
					expect(e.name).toEqual("ValidationError");
					expect(e.errors[field].message).toEqual(`Path \`${field}\` is required.`)
				});
			});
		});


		it("should create property if field length is less than specified limit", ()=> {
			let validData = {
				name: "Paradise",
				description: "Luxury hotel with swimming pools",
				price: 4000,
				latitude: 12334,
				longitude: 3444,
				address: "12, some street, city"
			};

			let propertyController = new PropertyController();
			
			let fieldsLength = {
				name: 50,
				description: 300,
				price: 5,
				latitude: 20,
				longitude: 20,
				address: 250
			};
			
			return propertyController.create({ body: validData }, res).then(result => {
				return Property.findOne(validData).then(validData => {
					_.each(fieldsLength, (value, key) => {
						 expect(validData[key].toString.length).toBeLessThan(value);
					});
				});
			});			
		});

	});

});