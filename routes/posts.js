const express = require('express');
const router = express.Router();
const path = require('path');
const Category = require('../models/Category');
const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');


router.get('/new', (req, res) => {
    if (req.url == "/new") {
        var pathPost = true;
    }
    if (!req.session.userId) {
        res.redirect('/users/login');
    }
    Category.find({}).sort({ $natural: -1 }).lean().then(categories => {
        res.render('site/addpost', { categories: categories, pathPost: pathPost });
    });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

router.get('/search', (req, res) => {
    if (req.query.look) {
        const regex = new RegExp(escapeRegex(req.query.look), 'gi');
        Post.find({ "title": regex }).populate({ path: 'author', model: User }).sort({ $natural: -1 }).lean().then(posts => {
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
                res.render('site/blog', { posts: posts, categories: categories })
            });
        });
    }
});

router.get('/category/:categoryId', (req, res) => {
    if (req.url == `/category/${req.params.categoryId}`) {
        var pathBlog = true;
    }
    Post.find({ category: req.params.categoryId }).populate({ path: 'category', model: Category }).populate({ path: 'author', model: User }).lean().then(posts => {
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
            res.render('site/blog', { posts: posts, categories: categories, pathBlog: pathBlog });
        });
    });
});

router.get('/:id', (req, res) => {
    if (req.url == `/${req.params.id}`) {
        var pathBlog = true;
    }
    Post.findById(req.params.id).populate({ path: 'author', model: User }).populate('comments').lean().then(post => {
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
            Post.find({}).populate({ path: 'author', model: User }).sort({ $natural: -1 }).lean().then(posts => {
                res.render('site/post', { post: post, categories: categories, posts: posts, pathBlog: pathBlog });
            });
        });
    });
});
router.post('/create', (req, res) => {
    if (!req.session.userId) {
        res.redirect('/users/login');
    }
    let post_image = req.files.post_image;
    post_image.mv(path.resolve(__dirname, '../public/img/postimages', post_image.name));
    Post.create({
        ...req.body,
        post_image: `/img/postimages/${post_image.name}`,
        author: req.session.userId
    });

    req.session.sessionFlash = {
        type: 'alert alert-success',
        message: 'Postunuz başarılı bir şekilde oluşturuldu.'
    }

    res.redirect('/blog');
});

router.post('/:postId/comments', (req, res) => {
    const comment = new Comment(req.body);
    comment
        .save()
        .then(comment => {
            return Post.findById(req.params.postId);
        })
        .then(post => {
            post.comments.unshift(comment);
            return post.save();
        })
        .then(post => {
            res.redirect(`/blog`);
        })
        .catch(err => {
            console.log(err);
        });
});

module.exports = router;