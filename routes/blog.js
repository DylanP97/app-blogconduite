const express = require('express');
const router = express.Router();
const blogCtrl = require('../controllers/blog')

const auth = require('../middleware/auth');
const multer = require('../middleware/multer');

router.get('/', blogCtrl.getAllBlogs);
router.get('/published/', blogCtrl.getAllPublishedBlogs);
router.get('/:id', blogCtrl.getOneBlog);
router.post('/', auth, multer, blogCtrl.createBlog);
router.put('/:id', auth, multer, blogCtrl.modifyBlog);
router.delete('/:id', auth, blogCtrl.deleteBlog);

module.exports = router;