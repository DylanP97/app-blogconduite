const express = require('express');
const router = express.Router();
const commentCtrl = require('../controllers/comment')

const auth = require('../middleware/auth');
const multer = require('../middleware/multer');

router.get('/', commentCtrl.getAllComments);
router.get('/:id', commentCtrl.getOneComment);
router.post('/', auth, multer, commentCtrl.addComment);
router.put('/:id', auth, multer, commentCtrl.modifyComment);
router.delete('/:id', auth, commentCtrl.deleteComment);

module.exports = router;