const multer = require('multer');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png',
}

const storage = multer.diskStorage({
    destination: (req, file, callback) => {

        const userPath = './uploads/profil'
        const blogPath = './uploads/articles'

        const path = (req.body.pseudo) ? userPath : blogPath;
        callback(null, path) 
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype];
        callback(null, + Date.now() + name);
    },
})


module.exports = multer({ storage: storage, limits: { fieldSize: 25 * 1024 * 1024 } }).single('imageUrl');


