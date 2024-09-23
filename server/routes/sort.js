// Import your Post model
const Post = require('../models/Post'); // Adjust the path to your model

// Route for fetching posts
app.get('/', async (req, res) => {
  try {
    const { sort } = req.query; // Get the sort query parameter (if provided)

    // Determine sorting order
    let sortOrder = -1; // Default to latest to oldest
    if (sort === 'oldest') {
      sortOrder = 1; // Change to oldest to latest
    }

    // Fetch sorted posts from MongoDB
    const posts = await Post.find().sort({ timePost: sortOrder });

    // Pagination logic (if needed)
    const page = parseInt(req.query.page) || 1;
    const perPage = 9;
    const totalPages = Math.ceil(await Post.countDocuments() / perPage);
    const paginatedPosts = await Post.find()
      .sort({ timePost: sortOrder })
      .skip((page - 1) * perPage)
      .limit(perPage);

    // Render the posts to the EJS template
    res.render('index', { 
      data: paginatedPosts, 
      page, 
      totalPages 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});
