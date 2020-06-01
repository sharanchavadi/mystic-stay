'use strict';

module.exports = class AbstractClass{
    
    constructor(model){
    	this.model = model;
    }

    create(req, res) {
        return this.model.create(req.body)
            .then(result => res.send(result));
    }

    all(req, res) {
        return this.model.find({})
            .then(result => res.send(result));
    }

    read(req, res) {
        return this.model.findById(req.params.id)
            .then(result => {res.send(result)});
    }

    delete(req, res) {
        return this.model.findByIdAndRemove(req.params.id)
            .then(result => res.send(result));
    }

    _update(id, data) {
        return this.model.findByIdAndUpdate(id, {$set: data})
            .then(result => {
                    return this.model.findById(id).then(object => {
                        return object;
                    })
                })
    }

    update(req, res) {
        //console.log(req);
        return this._update(req.params.id, req.body).then(updatedObject => {
            res.send(updatedObject);
        });
    }

}