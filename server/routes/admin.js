const express = require('express');
require('dotenv').config();
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;

// Check Login 
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized, please log in' });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({ message: 'Unauthorized' });
    }
};

module.exports = authMiddleware;

router.get('/admin', (req, res) => {
    res.render('admin/login', { message: null });
});

router.post('/admin', async (req, res) => {
    try { 
        const { username, password } = req.body;
        const user = await User.findOne({ username });
      
        if (!user) {
            return res.render('admin/login', { message: { type: 'danger', text: 'Invalid credentials, try again.' } });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.render('admin/login', { message: { type: 'danger', text: 'Invalid credentials, try again.' } });
        }

        const token = jwt.sign({ userId: user._id }, jwtSecret);
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/dashboard');
    } catch (error) { 
        console.log(error);
        res.render('admin/login', { message: { type: 'danger', text: 'Internal server error.' } });
    }
});

// GET Dashboard 
router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        const data = await Post.find();
        res.render('admin/dashboard', { data, layout: adminLayout, message: null });
    } catch (error) {
        console.log(error);
        res.render('admin/dashboard', { data: [], layout: adminLayout, message: { type: 'danger', text: 'Failed to retrieve posts.' } });
    }
});

// GET CreatePost Page
router.get('/CreatePost', authMiddleware, async (req, res) => {
    res.render('admin/CreatePost', { layout: adminLayout, });
});

// POST Add New Post
router.post('/CreatePost', authMiddleware, async (req, res) => {
    const user = 'admin';
    try {
        const newPost = new Post({
            title: req.body.title,
            postedby: user,
            body: req.body.body
              });

        await Post.create(newPost);
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
        res.render('admin/CreatePost', { layout: adminLayout, message: { type: 'danger', text: 'Failed to create post.' } });
    }
});

// PUT Edit Post
router.put('/edit-post/:id', authMiddleware, async (req, res) => {
    const user = 'admin';
    try {
        await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            postedby: user,
            body: req.body.body,
            updatedAt: Date.now()
        });
        res.redirect(`/edit-post/${req.params.id}`);
    } catch (error) {
        console.log(error);
        res.redirect(`/edit-post/${req.params.id}`);
    }
});

// GET Edit Post Page
router.get('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
        const data = await Post.findOne({ _id: req.params.id });
        res.render('admin/edit-post', { data, layout: adminLayout, message: null });
    } catch (error) {
        console.log(error);
        res.render('admin/edit-post', { data: {}, layout: adminLayout, message: { type: 'danger', text: 'Failed to load post.' } });
    }
});

// DELETE Post
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
    try {
        await Post.deleteOne({ _id: req.params.id });
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
        res.redirect('/dashboard');
    }
});

// GET Logout
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/admin');
});

// POST Register New User
router.post('/register', async (req, res) => {
    try {
        const { firstname, surname, username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const user = await User.create({ firstname, surname, username, password: hashedPassword });
            return res.render('admin/login', { message: { type: 'success', text: 'User successfully created' } });
        } catch (error) {
            if (error.code === 11000) {
                return res.render('admin/login', { message: { type: 'danger', text: 'User Already Exists .' } });
            }
            console.error('Error creating user:', error);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        return res.status(500).json({ message: 'Unexpected error.' });
    }
});

module.exports = router;
