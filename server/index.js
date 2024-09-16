import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import cors from 'cors';
import {
    loginValidation,
    postCreateValidation,
    registerValidation,
} from './validations/validations.js';
import checkAuth from './utils/checkAuth.js';
import { getMe, register, login } from './contollers/UserController.js';
import {
    create,
    getAll,
    getLastTags,
    getOne,
    remove,
    update,
} from './contollers/PostController.js';
import handleValidationErrors from './utils/handleValidationErrors.js';

mongoose
    .connect(
        'mongodb+srv://admin:12345@cluster0.xcekufi.mongodb.net/blog?retryWrites=true&w=majority',
    )
    .then(() => console.log('connected to db'))
    .catch((err) => console.log('something wrong with db', err));

const app = express();

const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        cb(null, 'uploads');
    },
    filename: (_, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage });

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

app.post('/auth/login', loginValidation, handleValidationErrors, login);
app.post(
    '/auth/register',
    registerValidation,
    handleValidationErrors,
    register,
);
app.get('/auth/me', checkAuth, getMe);

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
    res.json({
        url: `/uploads/${req.file.originalname}`,
    });
});

app.get('/tags', getLastTags);

app.get('/posts', getAll);
app.get('/posts/tags', getLastTags);
app.get('/posts/:id', getOne);
app.post(
    '/posts',
    checkAuth,
    postCreateValidation,
    handleValidationErrors,
    create,
);
app.delete('/posts/:id', checkAuth, remove);
app.patch(
    '/posts/:id',
    checkAuth,
    postCreateValidation,
    handleValidationErrors,
    update,
);

app.listen(4444, (err) => {
    if (err) {
        return console.log(err);
    }

    console.log('Server started on 4444 port');
});
