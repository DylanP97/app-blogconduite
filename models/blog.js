const { Schema, model } = require('mongoose')


const BlogModel = new Schema({
    posterId: {type: String},
    title: {type: String},
    category: {type: String},
    _id: String,
    slug: {type: String},
    data: Object,
    imageUrl: {type: String},
    published: {type: Boolean, default: false}
  },
  {
    timestamps: true,
  }
);

module.exports = model("blog", BlogModel);
