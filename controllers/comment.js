const CommentModel = require('../models/comment');
const ObjectID = require("mongoose").Types.ObjectId;
const fs = require('fs');


exports.getAllComments = (req, res, next) => {
   
    CommentModel.find().sort({ createdAt: -1 })
        .then((comments) => res.status(200).json(comments))
        .catch((error) => res.status(400).json({ message: error }))
}

exports.getOneComment = (req, res, next) => {

    CommentModel.findOne({ _id: req.params.id })
        .then(comment => res.status(200).json(comment))
        .catch(error => res.status(404).json({ error }));
}    

module.exports.addComment = (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send("ID unknown : " + req.params.id);
    
////////////////////////////////?????

    };
    
    module.exports.modifyComment = (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send("ID unknown : " + req.params.id);
        
////////////////////////////////?????

    };
    
    module.exports.deleteComment = (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send("ID unknown : " + req.params.id);
    
////////////////////////////////?????

    };