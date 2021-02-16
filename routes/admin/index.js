const express = require('express');
const router = express.Router();
const Category = require('../../models/Category');
const Post = require('../../models/Post');
const path = require('path');

router.get('/', (req, res) => {
    if (req.url == "/") {
        var pathAdmin = true;
    }
    if (!req.session.userId) {
        res.redirect('/users/login');
    }
    res.render('admin/index', { pathAdmin: pathAdmin });
});
router.get('/categories', (req, res) => {
    if (req.url == "/categories") {
        var pathAdmin = true;
    }
    if (!req.session.userId) {
        res.redirect('/users/login');
    }
    Category.find({}).sort({ $natural: -1 }).lean().then(categories => {
        res.render('admin/categories', { categories: categories, pathAdmin: pathAdmin });
    });
});
router.post('/categories', (req, res) => {
    if (!req.session.userId) {
        res.redirect('/users/login');
    }
    Category.create(req.body, (error, category) => {
        if (!error) {
            res.redirect('categories');
        }
    });
});
router.delete('/categories/:id', (req, res) => {
    if (!req.session.userId) {
        res.redirect('/users/login');
    }
    Category.remove({ _id: req.params.id }).lean().then(() => {
        res.redirect('/admin/categories');
    });
});

router.get('/posts', (req, res) => {
    if (req.url == "/posts") {
        var pathAdmin = true;
    }
    if (!req.session.userId) {
        res.redirect('/users/login');
    }
    Post.find({}).populate({ path: 'category', model: Category }).sort({ $natural: -1 }).lean().then(posts => {
        res.render('admin/posts', { posts: posts, pathAdmin: pathAdmin });
    });
});
router.delete('/posts/:id', (req, res) => {
    if (!req.session.userId) {
        res.redirect('/users/login');
    }
    Post.remove({ _id: req.params.id }).lean().then(() => {
        res.redirect('/admin/posts');
    });
});
router.get('/posts/edit/:id', (req, res) => {
    if (!req.session.userId) {
        res.redirect('/users/login');
    }
    if (req.url == `/posts/edit/${req.params.id}`) {
        var pathAdmin = true;
    }
    Post.findOne({ _id: req.params.id }).lean().then(post => {
        Category.find({}).lean().then(categories => {
            res.render('admin/editpost', { post: post, categories: categories, pathAdmin: pathAdmin });
        });
    });
});
router.put('/posts/:id', (req, res) => {
    if (!req.session.userId) {
        res.redirect('/users/login');
    }
    let post_image = req.files.post_image;
    post_image.mv(path.resolve(__dirname, '../../public/img/postimages', post_image.name));

    Post.findOne({ _id: req.params.id }).then(post => {
        post.title = req.body.title
        post.content = req.body.content
        post.date = req.body.date
        post.category = req.body.category
        post.post_image = `/img/postimages/${post_image.name}`

        post.save().then(post => {
            res.redirect('/admin/posts');
        });
    });
});

module.exports = router;