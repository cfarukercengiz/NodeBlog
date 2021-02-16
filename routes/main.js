const express = require('express');
const Post = require('../models/Post');
const Category = require('../models/Category');
const User = require('../models/User');
const router = express.Router();

router.get('/', (req, res) => {
    console.log(req.session);
    if (req.url == "/") {
        var pathHome = true;
    }
    res.render('site/index', { pathHome: pathHome });
});
router.get('/about', (req, res) => {
    if (req.url == "/about") {
        var pathAbout = true;
    }
    res.render('site/about', { pathAbout: pathAbout });
});
router.get('/blog', (req, res) => {
    if (req.url === "/blog") {
        var pathBlog = true;
    }

    const postPerPage = 4
    const page = req.query.page || 1

    Post.find({}).populate({ path: 'author', model: User }).sort({ $natural: -1 }).lean()
        .skip((postPerPage * page) - postPerPage)
        .limit(postPerPage)
        .then(posts => {
            Post.countDocuments().then(postCount => {
                Category.aggregate([
                    {
                        $lookup: {
                            from: 'posts',
                            localField: '_id',
                            foreignField: 'category',
                            as: 'posts'
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            num_of_posts: { $size: '$posts' }
                        }
                    }
                ]).then(categories => {
                    res.render('site/blog', {
                        posts: posts,
                        pathBlog: pathBlog,
                        categories: categories,
                        current: parseInt(page),
                        pages: Math.ceil(postCount / postPerPage)
                    });
                });
            });
        });
});
router.get('/contact', (req, res) => {
    if (req.url == "/contact") {
        var pathContact = true;
    }
    res.render('site/contact', { pathContact: pathContact });
});

module.exports = router;