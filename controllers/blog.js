const BlogModel = require("../models/blog");
const fs = require("fs");

exports.getAllBlogs = (req, res, next) => {
  BlogModel.find()
    .sort({ createdAt: -1 })
    .then((blogs) => res.status(200).json(blogs))
    .catch((error) => res.status(400).json({ message: error }));
};

exports.getAllPublishedBlogs = (req, res, next) => {
  BlogModel.find({ published: true })
    .sort({ createdAt: -1 })
    .then((blogs) => res.status(200).json(blogs))
    .catch((error) => res.status(400).json({ message: error }));
};

exports.getOneBlog = (req, res, next) => {
  BlogModel.findOne({ _id: req.params.id })
    .then((blog) => res.status(200).json(blog))
    .catch((error) => res.status(200).json({ error }));
};

exports.createBlog = (req, res, next) => {
  try {
    BlogModel.create({
      _id: req.body.id,
      data: "",
      title: "",
      slug: "",
      category: "",
      imageUrl: "",
    });
    res.status(200).json({ message: "blog created" });
  } catch {
    res.status(400).json(error);
  }
};

exports.modifyBlog = async (req, res, next) => {
  const blogObject = { ...req.body };
  if (req.file) {
    blogObject.imageUrl = "uploads/articles/" + `${req.file.filename}`;
  }
  if (req.body.data) {
    blogObject.data = JSON.parse(req.body.data);
  }

  BlogModel.findOne({ _id: req.params.id })
    .then((blog) => {
      if (!blog) {
        return res.status(404).json({ message: "Blog non trouvé" });
      }

      let updateQuery = { ...blogObject, _id: req.params.id };
      if (req.file && blog.imageUrl) {
        fs.unlink(blog.imageUrl, (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("Fichier supprimé avec succès.");
          }
        });
      }

      BlogModel.updateOne({ _id: req.params.id }, updateQuery)
        .then(() => res.status(200).json({ message: "Blog modifié !" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.deleteBlog = (req, res, next) => {
  BlogModel.findOne({ _id: req.params.id })
    .then((blog) => {
      if (res.auth.isAdmin === true) {
        BlogModel.findOneAndDelete({ _id: req.params.id })
          .then(() => {
            res.status(200).json({ message: "Blog supprimé !" });
          })
          .catch((error) => res.status(401).json({ error }));
      } else {
        {
          res
            .status(401)
            .json({ message: "Vous n'êtes pas authorisé à modifier ce blog!" });
        }
      }
    })
    .catch((error) => res.status(500).json({ error }));
};
