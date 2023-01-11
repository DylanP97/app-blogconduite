const { Schema, model } = require('mongoose')


const BlogModel = new Schema({
    posterId: {type: String},
    title: {type: String},
    category: {type: String},
    _id: String,
    data: Object,
    // message: {type: String},
    imageUrl: {type: String},
    published: {type: Boolean, default: false}
    // comments: {
    //   type: [
    //     {
    //       commenterId: String,
    //       commenterFirstName: String,
    //       text: String,
    //       timestamp: Number,
    //     },
    //   ],
    // },
  },
  {
    timestamps: true,
  }
);

module.exports = model("blog", BlogModel);
