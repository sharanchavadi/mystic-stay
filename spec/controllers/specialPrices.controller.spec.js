'use strict';

let _ = require("lodash");
let mongoose = require('mongoose');

let connection = mongoose.connect('mongodb://localhost/travel_nomad_test');
const Schema = mongoose.Schema;

let SpecialPriceSchema = new Schema({
    price: {
    	type: Number, 
    	required: true, 
    	min: 100,
    	max: 5000
    	//Todo
    	//validate: {validator: Number.isInteger, message: '{VALUE} is not an integer'}
    },
    startDate: {
    	type: Date, 
    	required: true 
    },
    endDate: {
    	type: Date, 
    	required: true, 
    	validate: [dateValidator, 'startDate must be less than endDate']
    }  
});

const SpecialPrice = mongoose.model('SpecialPrice', SpecialPriceSchema);
// function that validate the startDate and endDate
function dateValidator(endDate){
	// `this` is the mongoose document
	return this.startDate < endDate;
}

var options = { runValidators: true, context: 'query' };

class SpecialPricesController{
	create(req, res) {
        return SpecialPrice.create(req.body)
            .then(result => { res.send(result); });
    }
	_update(id, data) {
        return SpecialPrice.findByIdAndUpdate(id, {$set: data}, options)
        	.then(result => { return SpecialPrice.findById(id)
        		.then(object => { return object; }); 
        	});
    }
	update(req, res) {
        return this._update(req.params.id, req.body)
        	.then(updatedObject => { res.send(updatedObject); });
    }
    read(req, res) {
        return SpecialPrice.findById(req.params.id)
            .then(result => { res.send(result); });
    }
    all(req, res) {
    	return SpecialPrice.find({})
    		.then(result => { res.send(result); });
    }
    delete(req, res) {
    	return SpecialPrice.findByIdAndRemove(req.params.id)
    		.then(result => { res.send(result); });
    }
}

describe('SpecialPricesController', () => {
    
    let res = { send: function() {}};
	beforeEach(() => {
		spyOn(res, 'send');
		return mongoose.connection.dropDatabase();
	});
    
    describe('Create', () => {
		
		it('should create record with all the fields', () => {
			
			let data = {
				price: 1500,
				startDate: new Date("2020-06-03"),
				endDate: new Date("2020-06-28")
			};
			let specialPricesController = new SpecialPricesController();
			let newSpecialPrice = {};
			return specialPricesController.create({ body: data }, res).then(result => {
				expect(res.send).toHaveBeenCalledTimes(1);
				return SpecialPrice.findOne(data).then(newSpecialPrice => {
					_.each(data, (value, key) => {
						expect(newSpecialPrice[key]).toEqual(value);
					});
				});
			});
		});

		it('should not create record if any field is missing', () => {
			
			let data = {
				price: 1500,
				startDate: "2020-06-03",
				endDate: "2020-06-28"
			};

			let fields = ["price", "startDate", "endDate"];
            let invalidData = Object.assign({}, data);
            let specialPricesController = new SpecialPricesController();

			_.each(fields, (field, index) => {
				delete invalidData[field];
				return specialPricesController.create({ body: invalidData }, res).then(result => {
				    fail("create shouldn't pass");}).catch(e => {
					expect(e.name).toEqual("ValidationError"); 
					expect(e.errors[field].message).toEqual(`Path \`${field}\` is required.`);
				});
			});
		});

		it('should not create record if price is greater than specified limit', () => {

			let data = {
				price: 6000,
				startDate: "2020-06-03",
				endDate: "2020-06-28"
			};

			let specialPricesController = new SpecialPricesController();

			return specialPricesController.create({body: data}, res).then(result => {
				fail("create shouldn't pass");}).catch(e => {
					expect(e.name).toEqual("ValidationError"); 
					expect(e.errors["price"].message).toEqual(`Path \`price\` (${data["price"]}) is more than maximum allowed value (5000).`); 
			});
		});

		//revisit this one
		it('should create record if price is numerical', () => {

			let data = {
				price: 1500,
				startDate: "2020-06-03",
				endDate: "2020-06-28"
			};

			let specialPricesController = new SpecialPricesController();

			return specialPricesController.create({body: data}, res).then(result => {
				return SpecialPrice.findOne(data).then(newSpecialPrice => {
					expect(typeof newSpecialPrice["price"]).toBe('number');
				});
			});
		});

		it('should create record if startDate is less than endDate', () => {

			let data = {
				price: 1500,
				startDate: "2020-06-03",
				endDate: "2020-06-28"
			};

			let specialPricesController = new SpecialPricesController();

			return specialPricesController.create({body: data}, res).then(result => {
				return SpecialPrice.findOne(data).then(newSpecialPrice => {
					expect(newSpecialPrice["startDate"]).toBeLessThan(newSpecialPrice["endDate"]);
				});
			});
		});

		it('should not create record if price is not numerical', () => {
			
			let data = {
				price: "xyz",
				startDate: "2020-06-03",
				endDate: "2020-06-28"
			};

			let specialPricesController = new SpecialPricesController();
			
			return specialPricesController.create({body: data}, res).then(result => {
				fail("create shouldn't pass");}).catch(e => { 
					expect(e.name).toEqual("ValidationError"); 
					expect(e.errors["price"].message).toEqual(`Cast to Number failed for value "${data["price"]}" at path "price"`);
			});
		
		});

		it('should not create record if price is less than specified limit', () => {
			
			let data = {
				price: 0,
				startDate: "2020-06-03",
				endDate: "2020-06-28"
			};

			let specialPricesController = new SpecialPricesController();
			
			return specialPricesController.create({body: data}, res).then(result => {
				fail("create shouldn't pass");}).catch(e => { 
					expect(e.name).toEqual("ValidationError"); 
					expect(e.errors["price"].message).toEqual(`Path \`price\` (${data["price"]}) is less than minimum allowed value (100).`); 

			});
		});
		
		it('should not create record if startDate is greater than or equal to endDate', () => {
			
			let data = {
				price: 1500,
				startDate: "2020-06-28",
				endDate: "2020-06-03"
			};

			let specialPricesController = new SpecialPricesController();
			
			return specialPricesController.create({body: data}, res).then(result => {
				fail("create shouldn't pass");}).catch(e => { 
					expect(e.name).toEqual("ValidationError"); 
					expect(e.errors["endDate"].message).toEqual('startDate must be less than endDate');
			});
		});

		it('should not create record if startDate and endDate is invalid', () => {

			let data = {
				price: 1500,
				startDate: "xyz",
				endDate: "xyz"
			};

			let specialPricesController = new SpecialPricesController();
			
			return specialPricesController.create({body: data}, res).then(result => {
				fail("create shouldn't pass");}).catch(e => {
					expect(e.name).toEqual("ValidationError"); 
					expect(e.errors["startDate"].message).toEqual(`Cast to Date failed for value "${data["startDate"]}" at path "startDate"`);
					expect(e.errors["endDate"].message).toEqual(`Cast to Date failed for value "${data["endDate"]}" at path "endDate"`);
			});
		});
	});
	
	describe('Update', () => {

		let data = {
				price: 1500,
				startDate: "2020-06-03",
				endDate: "2020-06-28"
			};

		it('should find record by id and update the record', () => {

			let specialPricesController = new SpecialPricesController();

			return SpecialPrice.create(data).then(newSpecialPrice => {
				return specialPricesController.update({params:{id: newSpecialPrice.id}, body: {price: 2000}}, res).then(_ => {
					SpecialPrice.findById(newSpecialPrice.id).then(updatedSpecialPrice => {
						expect(updatedSpecialPrice.price).toEqual(2000);
					});
				});
			});
		});

		it('should not update record if fields are empty', () => {

			let specialPricesController = new SpecialPricesController();

			return SpecialPrice.create(data).then(newSpecialPrice => {
				return specialPricesController.update({params:{id: newSpecialPrice.id}, body: {price: ''}}, res).catch(e => {
					expect(e.name).toEqual("ValidationError");
					expect(e.errors["price"].message).toEqual("Path \`price\` is required.")
				});
			});
		});

		it('should not update record if price is less than specified limit', () => {

			let specialPricesController = new SpecialPricesController();

			return SpecialPrice.create(data).then(newSpecialPrice => {
				return specialPricesController.update({params:{id: newSpecialPrice.id}, body: {price: 50}}, res).catch(e => {
					expect(e.name).toEqual("ValidationError");
					expect(e.errors["price"].message).toEqual(`Path \`price\` (${e.errors["price"].value}) is less than minimum allowed value (100).`);
				});
			});
		});

		it('should not update record if price is greater than specified limit', () => {

			let specialPricesController = new SpecialPricesController();

			return SpecialPrice.create(data).then(newSpecialPrice => {
				return specialPricesController.update({params:{id: newSpecialPrice.id}, body: {price: 6000}}, res).catch(e => {
					expect(e.name).toEqual("ValidationError");
					expect(e.errors["price"].message).toEqual(`Path \`price\` (${e.errors["price"].value}) is more than maximum allowed value (5000).`);
				});
			});
		});

		it('should update record if price is numerical', () => {

			let specialPricesController = new SpecialPricesController();

			return SpecialPrice.create(data).then(newSpecialPrice => {
				return specialPricesController.update({params:{id: newSpecialPrice.id}, body: {price: 2000}}, res).then(_ => {
					SpecialPrice.findById(newSpecialPrice.id).then(updatedSpecialPrice => {
						expect(typeof updatedSpecialPrice.price).toEqual('number');
					});
				});
			});
		});

		it('should not update record if price is not numerical', () => {

			let specialPricesController = new SpecialPricesController();

			return SpecialPrice.create(data).then(newSpecialPrice => {
				return specialPricesController.update({params:{id: newSpecialPrice.id}, body: {price: "xyz"}}, res).catch(e => {
					expect(e.name).toEqual('CastError');
					expect(e.message).toEqual(`Cast to number failed for value "${e.value}" at path "${e.path}"`);
				});
			});
		});

		it('should not update record if startDate and endDate are invalid', () => {

			let specialPricesController = new SpecialPricesController();

			return SpecialPrice.create(data).then(newSpecialPrice => {
				return specialPricesController.update({params:{id: newSpecialPrice.id}, body: {startDate: "xyz", endDate: "abc"}}, res).catch(e => {
					expect(e.name).toEqual('CastError');
					expect(e.message).toEqual(`Cast to date failed for value "${e.value}" at path "${e.path}"`);
				});
			});
		});

		it('should update record if startDate is less than endDate', () => {

			let specialPricesController = new SpecialPricesController();

			return SpecialPrice.create(data).then(newSpecialPrice => {
				return specialPricesController.update({params:{id: newSpecialPrice.id}, body: {startDate: '2020-06-03'}}, res).then(_ => {
					SpecialPrice.findById(newSpecialPrice.id).then(updatedSpecialPrice => {
						expect(updatedSpecialPrice.startDate).toBeLessThan(updatedSpecialPrice.endDate);
					});
				});
			});
		});

		it('should not update record if startDate is greater than or equals to endDate', () => {

			let specialPricesController = new SpecialPricesController();

			return SpecialPrice.create(data).then(newSpecialPrice => {
				return specialPricesController.update({params: {id: newSpecialPrice.id}, body: {endDate: '2020-06-28'}}, res)
				.catch(e => {
					expect(e.name).toEqual('ValidationError');
					expect(e.errors["endDate"].message).toEqual('startDate must be less than endDate');
				});
			});
		});

		it('should return null if id does not match', () => {

			let specialPricesController = new SpecialPricesController();

			return SpecialPrice.create(data).then(newSpecialPrice => {
				return specialPricesController.update({params:{id: newSpecialPrice.id}, body: {price: 2000}}, res).then(_ => {SpecialPrice.findById("34sdfsf323ds").then(updatedSpecialPrice => {
							expect(updatedSpecialPrice).toBe(null);
						});
					});
			});
		});

	});
	
	describe('Read', () => {

		let data = {
			id: 123, 
			price: 1500, 
			startDate: '2020-06-03', 
			endDate: '2020-06-28'
		};

		beforeEach(() => {
			spyOn(SpecialPrice, 'findById').and.returnValue(Promise.resolve(data));
		});

		it('should find record by id and return', () => {

			let specialPricesController = new SpecialPricesController();

         	return specialPricesController.read({params:{id: data.id}}, res).then(result => { 
				expect(SpecialPrice.findById).toHaveBeenCalledWith(data.id);
				expect(res.send).toHaveBeenCalledWith(data);
			});
		});

	});

	describe('All', () => {

		let data = {
			id: 123, 
			price: 1500, 
			startDate: '2020-06-03', 
			endDate: '2020-06-28'
		};

		beforeEach(() => {
			spyOn(SpecialPrice, 'find').and.returnValue(Promise.resolve(data));
		});

		it('should find all records and return them', () => {
			
			let specialPricesController = new SpecialPricesController();

			return specialPricesController.all({}, res).then(result => { 
				expect(SpecialPrice.find).toHaveBeenCalledTimes(1);
				expect(res.send).toHaveBeenCalledWith(data);
			});
		});
	});

	describe('Delete', () => {

		let data = {
			id: 123, 
			price: 1500, 
			startDate: '2020-06-03', 
			endDate: '2020-06-28'
		};

		beforeEach(() => {
			spyOn(SpecialPrice, 'findByIdAndRemove').and.returnValue(Promise.resolve(data));
		});

		it('should find record by id and remove it', () => {

			let specialPricesController = new SpecialPricesController();

			return specialPricesController.delete({params: {id: data.id}}, res).then(result => {
				expect(SpecialPrice.findByIdAndRemove).toHaveBeenCalledWith(data.id);
				expect(res.send).toHaveBeenCalledWith(data);
			});
		});
	});

});