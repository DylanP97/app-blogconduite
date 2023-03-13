const express = require('express');
const router = express.Router();
const blogCtrl = require('../controllers/blog')

const auth = require('../middleware/checkAuthorization');
const multer = require('../middleware/multer');

router.get('/', auth, blogCtrl.getAllBlogs);
router.get('/published/', auth, blogCtrl.getAllPublishedBlogs);
router.get('/:id', auth, blogCtrl.getOneBlog);
router.post('/', auth, multer, blogCtrl.createBlog);
router.put('/:id', auth, multer, blogCtrl.modifyBlog);
router.delete('/:id', auth, blogCtrl.deleteBlog);

module.exports = router;