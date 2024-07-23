const express = require('express');
const router = express.Router();
const Post = require('../models/Post');


//Routes
router.get('', async (req, res) => {
    try {
        const data = await Post.find();
      
        const page = parseInt(req.query.page) || 1;
        const limit = 9;
        const skip = (page - 1) * limit;

        const totalPosts = await Post.countDocuments();
        const totalPages = Math.ceil(totalPosts / limit);

        const posts = await Post.find().skip(skip).limit(limit);
        res.render('index', { data: posts, page: page, totalPages: totalPages });
    } catch (error) {
        console.log(error);
    }

});
//GET to /post page
router.get('/post/:id',async (req, res) => {

    try
    {
        let slug = req.params.id;

        
        const data = await Post.findById({_id: slug})
        res.render('post', {data });
    }catch(error)
    {
        console.log(error);
    }
   
});
//Post to /Search
router.post('/search', async (req, res) => {
    try
    {
        let searchTerm = req.body.searchTerm;
        const searchNoSpeacialChar = searchTerm.replace(/[^a-zA-Z0-9]/g, "");

        const data = await Post.find({
            $or:[
                {title: {$regex: new RegExp(searchNoSpeacialChar, 'i') }},
                {Body: {$regex: new RegExp(searchNoSpeacialChar, 'i') }}
            ]})
            console.log(data);
            res.render('/search', {data} );

    }catch(error)
    {
        console.log(error);

    }
   
});


// function insertPostData () {
//     Post.insertMany([

//         {
//             title: "Building a Blog ",
//             body: "This is the body text "
//         },
//     ])
// }

// insertPostData();

router.get('/about', (req, res) => {
    res.render('about');
});



module.exports = router;