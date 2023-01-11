const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user')

const auth = require('../middleware/auth');
const multer = require('../middleware/multer');

router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);
router.post('/forgot-password', userCtrl.forgotpassword);
router.get('/reset/:token', userCtrl.getResetToken)
router.post('/reset/:token', userCtrl.updatePassword);
router.get("/logout", userCtrl.logout);

router.get('/', userCtrl.getAllUsers);
router.get('/:id', userCtrl.getOneUser);
router.put('/:id', auth, multer, userCtrl.updateUser);  
router.delete('/:id', auth, userCtrl.deleteUser);

module.exports = router;