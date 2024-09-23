const express = require('express');
const router = express.Router();
const Post = require('../models/Post');


//Routes
router.get('', async (req, res) => {
    try {
      const { sort } = req.query; // Get the sorting parameter from the query string
  
      const page = parseInt(req.query.page) || 1;
      const limit = 9;
      const skip = (page - 1) * limit;
  
      // Determine sorting order: -1 for Latest to Oldest, 1 for Oldest to Latest
      let sortOrder = -1;
      if (sort === 'oldest') {
        sortOrder = 1;
      }
  
      const totalPosts = await Post.countDocuments();
      const totalPages = Math.ceil(totalPosts / limit);
  
      // Fetch sorted posts with pagination
      const posts = await Post.find()
        .sort({ timePost: sortOrder })
        .skip(skip)
        .limit(limit);
  
      res.render('index', { data: posts, page: page, totalPages: totalPages });
    } catch (error) {
      console.log(error);
      res.status(500).send('Server error');
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
// Post to /search
router.post('/search', async (req, res) => {
  try {
      // Retrieve search term from the request body
      let searchTerm = req.body.searchTerm;
      
      // Remove special characters for the search term
      const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g, "");
      
      // Find posts that match the search term in title or body
      const data = await Post.find({
          $or: [
              { title: { $regex: new RegExp(searchNoSpecialChar, 'i') } },
              { body: { $regex: new RegExp(searchNoSpecialChar, 'i') } }
          ]
      });
      
      // Render the search results view with the data
      res.render('search', { data,     message: {
        type: 'success',
        text: 'Search completed successfully!'
    }});
      
  } catch (error) {
      console.error(error);
      // Optionally, render an error page or show an error message
      res.status(500).send( 
        {message: {type: 'success',text: 'Search completed successfully!'}} );
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