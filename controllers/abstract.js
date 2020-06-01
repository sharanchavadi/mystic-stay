'use strict';

module.exports = class AbstractClass{
    
    constructor(model){
    	this.model = model;
    }

    create(req, res) {
        return this.model.create(req.body)
            .then(result => res.send(result));
    }

}