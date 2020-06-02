'use strict';

let AmenityController = require("../../controllers/amenities.controller");
let Amenity = require("../../models/amenity.model");
let _ = require("lodash");


let mongoose = require('mongoose');
let connection = mongoose.connect('mongodb://localhost/travel_nomad_test');


describe("AmenitiesController", () => {
	let res = { send: function() {}};
	beforeEach(() => {
		spyOn(res, 'send'); //.and.stub();
		return mongoose.connection.dropDatabase();
	});
	describe("Create", ()=> {
		it("should create amenity with all the fields", () => {
			let validData = {
				name: "Pool",
				description: "Outdoor pool with towels"
			};

			let amenityController = new AmenityController();
			
			let newAmenity = {};
			
			return amenityController.create({ body: validData }, res).then(result => {
				expect(res.send).toHaveBeenCalledTimes(1);
				return Amenity.findOne(validData).then(newAmenity => {
					_.each(validData, (validValue, currentKey) => {
						expect(newAmenity[currentKey]).toEqual(validValue);
					});
				});
			});

		});

		it("should create amenity with only the mandatory fields", ()=> {
			let validData = {
				name: "Pool",
				description: "Outdoor pool with towels"
			};

			let amenityController = new AmenityController();
			
			let newAmenity = {};
			
			return amenityController.create({ body: validData }, res).then(result => {
				return Amenity.findOne(validData).then(newAmenity => {
					_.each(validData, (validValue, currentKey) => {
						expect(newAmenity[currentKey]).toEqual(validValue);
					})
				});
			});			
		});


		const mandatoryFields = ["name", "description"];
		const validData = {
			name: "Pool",
			description: "Outdoor pool with towels"
		};
		_.each(mandatoryFields, (field, index) => {
			it(`should not create amenity if the mandatory field '${field}' is missing`, ()=> {
				let invalidData = Object.assign({}, validData);

				delete invalidData[field];

				let amenityController = new AmenityController();
				
				//let newAmenity = {};
				
				return amenityController.create({ body: invalidData }, res).then(result => {
					fail("create shouldn't pass");
				}).catch(e => {
					expect(e.name).toEqual("ValidationError");
					expect(e.errors[field].message).toEqual(`Path \`${field}\` is required.`)
				});
			});
		});


		it("should create amenity if field length is less than specified limit", ()=> {
			let validData = {
				name: "Pool",
				description: "Outdoor pool with towels"
			};

			let amenityController = new AmenityController();
			
			let fieldsLength = {
				name: 50,
				description: 300
			};
			
			return amenityController.create({ body: validData }, res).then(result => {
				return Amenity.findOne(validData).then(validData => {
					_.each(fieldsLength, (value, key) => {
						expect(validData[key].toString.length).toBeLessThan(value);
					});
				});
			});			
		});

	});

	describe("Read", ()=> {
		let data = {id: 123, name: 'Pool', description: 'Outdoor pool with towels'};
		beforeEach(() => {
			spyOn(Amenity, 'findById').and.returnValue(Promise.resolve(data));
		});
		it("should find amenity by id", () => {
			let amenityController = new AmenityController();
            //console.log(validData.id);
			//return Amenity.create(validData).then(result => {
				return amenityController.read({params:{id: data.id}}, res).then(result => { 
					expect(Amenity.findById).toHaveBeenCalledWith(data.id);
					expect(res.send).toHaveBeenCalledWith(data);
				});
			//});
		});
	});


	describe("All", ()=> {
		let data = {id: 123, name: 'Pool', description: 'Outdoor pool with towels'};
		beforeEach(() => {
			spyOn(Amenity, 'find').and.returnValue(Promise.resolve(data));
		});

		it("should find all amenity", () => {
			let amenityController = new AmenityController();
			return amenityController.all({}, res).then(result => { 
				expect(Amenity.find).toHaveBeenCalledTimes(1);
				expect(res.send).toHaveBeenCalledWith(data);

			});
		});

	});

	describe("Delete", ()=> {
		let data = {id: 123, name: 'Pool', description: 'Outdoor pool with towels'};
		beforeEach(() => {
			spyOn(Amenity, 'findByIdAndRemove').and.returnValue(Promise.resolve(data));
		});

		it("should delete amenity", () => {
			let amenityController = new AmenityController();
			return amenityController.delete({params:{id: data.id}}, res).then(result => { 
				expect(Amenity.findByIdAndRemove).toHaveBeenCalledWith(data.id);
				expect(res.send).toHaveBeenCalledWith(data);

			});
		});

	});

	describe("Update", ()=> {
		let data = {name: 'Pool', description: 'Outdoor pool with towels'};
		// beforeEach(() => {
		// 	spyOn(Amenity, 'findByIdAndUpdate').and.returnValue(Promise.resolve(data));
		// });

		it("should update amenity", () => {
			let amenityController = new AmenityController();

			return Amenity.create(data).then(newAmenity => {
				return amenityController.update({params:{id: newAmenity.id}, body: {name: 'Corridor'}}, res).then(_ => {
					Amenity.findById(newAmenity.id).then(updatedAmenity => {
						//console.log(updatedAmenity);
						expect(updatedAmenity.name).toEqual('Corridor');
					});
				});
			});
			
		});
	});

});