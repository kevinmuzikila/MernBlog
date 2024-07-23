const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_Secret;
//Check Login 
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized pleasse Log-in' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({ message: 'Unauthorized' });
    }
};

module.exports = authMiddleware;
router.get('/admin', async (req, res) => {
    try {
        const local =
        {
            title: "Admin"
        }
        res.render('admin/login', { layout: adminLayout });
    } catch (error) {
        console.log(error)
    }
});

router.post('/admin', async (req, res) => {
    try { 
        const { username, password } = req.body;
      const user = await User.findOne({username })
      if(!user){
        return res.status(401).json({message: 'Invalid Creentials...Try Again '});
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if(!isPasswordValid){
        return res.status(401).json({message: 'Invalid Creentials...Try Again '});
      }
        const token = jwt.sign({ userId: user._id }, jwtSecret)
        res.cookie('token', token, {httpOnly: true});
        res.redirect('/dashboard')
        //res.redirect('/admin');
    } catch (error) { 
        console.log(error);
    }
});
//GET DashhhhhBoard 
router.get('/dashboard',authMiddleware, async (req, res) => {
    try{
        const data = await Post.find();
    res.render('admin/dashboard', {data, layout: adminLayout});
    }catch(error){
        console.log(); 
    }
});
//Post Add New ============================================================
router.get('/CreatePost',authMiddleware, async (req, res) => {
    try{
        const data = await Post.find();
    res.render('admin/CreatePost', {data, layout: adminLayout});
    }catch(error){
        console.log();
    }
});
//=============================================================================
router.post('/CreatePost',authMiddleware, async (req, res) => {
   const user = 'admin';
        try{
            console.log();
            try{
                const newPost = new Post ({
                    title: req.body.title,
                    postedby: user,
                    body: req.body.body

                });
                await Post.create(newPost)
                console.log('Posted ');
                res.redirect('/dashboard')
            // res.render('admin/CreatePost', {data, layout: adminLayout});
            }catch(error){
                console.log(error);
            }
           
        }catch(error){
                console.log(error);
        }
    
});
//EDIT POST===================================================================================
router.put('/edit-post/:id',authMiddleware, async (req, res) => {
const user = 'admin';
    try{
                 await Post.findByIdAndUpdate(req.params.id, {
                     title: req.body.title,
                     postedby: user,
                     body: req.body.body,
                     updatedAt: Date.now()

                 });

                 console.log('Posted ');
                 res.redirect(`/edit-post/${req.params.id}`);
             // res.render('admin/CreatePost', {data, layout: adminLayout});
             }catch(error){
                 console.log(error);
             }
            
     
 });
 //get edit ppost=============================================
 router.get('/edit-post/:id',authMiddleware, async (req, res) => {
    const user = 'admin';

        try{
        const data = await Post.findOne({_id: req.params.id});
        res.render('admin/edit-post', {data, layout: adminLayout});
                 }catch(error){
                     console.log(error);
                 } 
     });
    
//Delete post
router.delete('/delete-post/:id',authMiddleware, async (req, res) => {
    const user = 'admin';

        try{
        await Post.deleteOne({_id: req.params.id});
        res.redirect('/dashboard');
                 }catch(error){
                     console.log(error);
                 } 
     });
//Admin Logout==========================================================================
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    
    res.redirect('/admin');
});

//POST register================================================================================
router.post('/register', async (req, res) => {
    try {
        const { firstname, surname, username, password } = req.body;

        // Check if username and password are provided
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });

        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            // Create the user
            const user = await User.create({ firstname, surname, username, password: hashedPassword });
            return res.status(201).json({ message: 'User Created', user, }) 
        } catch (error) {
            if (error.code === 11000) {
                return res.status(409).json({ message: 'User Already Exists' });
            }
            console.error('Internal error creating user:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        return res.status(500).json({ message: 'Unexpected Error' });
    }
   
});

module.exports = router;

