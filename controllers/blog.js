const BlogModel = require('../models/blog');
const ObjectID = require("mongoose").Types.ObjectId;
const fs = require('fs');


exports.getAllBlogs = (req, res, next) => {
   
    BlogModel.find().sort({ createdAt: -1 })
        .then((blogs) => res.status(200).json(blogs))
        .catch((error) => res.status(400).json({ message: error }))
}

exports.getAllPublishedBlogs = (req, res, next) => {
   
    BlogModel.find({ published: true}).sort({ createdAt: -1 })
        .then((blogs) => res.status(200).json(blogs))
        .catch((error) => res.status(400).json({ message: error }))
}

exports.getOneBlog = (req, res, next) => {

    BlogModel.findOne({ _id: req.params.id })
        .then(blog => res.status(200).json(blog))
        .catch(error => res.status(404).json({ error }));
}    

exports.addBlog = (req, res, next) => {
    
    const blogObject =  req.file ? {
        ...req.body,
        imageUrl: req.file !== null ? "uploads/articles/" + `${req.file.filename}` : "",
    } : { ...req.body };

    const blog = new BlogModel({
        ...blogObject
    });

    if (res.auth.isAdmin === true) {
    blog.save()
        .then(() => { res.status(201).json({message: 'Blog ajouté !'})})
        .catch(error => { res.status(400).json( { error })})
    } else {
        { res.status(401).json({message: "Vous n'êtes pas authorisé avec ce compte!"})}
    }
}

exports.modifyBlog = (req, res, next) => {

    var blogObject = {}

    if (req.body.data) {
        if (req.file) {
            blogObject = {
                ...req.body,
                imageUrl:  "uploads/articles/" + `${req.file.filename}`,
                data: JSON.parse(req.body.data),
            }
        } else if (!req.file) {
            blogObject = {
                ...req.body,
                data: JSON.parse(req.body.data),
            }
    }
    } else if (!req.body.data) {
        if (req.file) {
            blogObject = {
                ...req.body,
                imageUrl:  "uploads/articles/" + `${req.file.filename}`,
            }
        } else if (!req.file) {
            blogObject = {
                ...req.body,
            }
        }
    }

    BlogModel.findOne({ _id: req.params.id})
        .then((blog) => {

            if (req.file){
            fs.unlink(blog.imageUrl, (err) => {
                if (err) {
                    console.log(err)
                }
                else console.log("Delete File successfully.");
            });}

            if (res.auth.isAdmin === true) {
                BlogModel.findOneAndUpdate({ _id: req.params.id}, { ...blogObject, _id: req.params.id})
                .then(() => {res.status(200).json({message: "Blog modifié !"})})
                .catch(error => {res.status(400).json({ error })});
            } else {
                { res.status(401).json({message: "Vous n'êtes pas authorisé à modifier ce blog!"})}
            }
        })
        .catch(error => {res.status(400).json({ error })});
    }

exports.deleteBlog = (req, res, next) => {
    
    BlogModel.findOne({ _id: req.params.id})
        .then((blog) => {
            if (res.auth.isAdmin === true) {
            BlogModel.findOneAndDelete({ _id: req.params.id })
                .then(() => { res.status(200).json({message: "Blog supprimé !"})})
                .catch(error => res.status(401).json({ error }))
            } else {
                { res.status(401).json({message: "Vous n'êtes pas authorisé à modifier ce blog!"})}
            }
        })
        .catch(error => res.status(500).json({ error }));
};