const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/register', (req, res) => {
    if (req.url == "/register") {
        var pathRegister = true;
    }
    res.render('site/register', { pathRegister: pathRegister });
});
router.post('/register', (req, res) => {
    const email = req.body.email;
    User.findOne({ email: email }).then(kullanici => {
        if (!kullanici) {
            User.create(req.body, (error, user) => {
                req.session.sessionFlash = {
                    type: 'alert alert-success',
                    message: 'Kullanıcı başarılı bir şekilde oluşturuldu.'
                }
                res.redirect('/users/login');
            });
        } else {
            req.session.sessionFlash = {
                type: 'alert alert-danger',
                message: 'Kullanıcı daha önceden oluşturulmuş.'
            }
            res.redirect('/users/register');
        }
    })
});



router.get('/login', (req, res) => {
    if (req.url == "/login") {
        var pathLogin = true;
    }
    res.render('site/login', { pathLogin: pathLogin });
});
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    User.findOne({ email }, (error, user) => {
        if (user) {
            if (user.password == password) {
                req.session.userId = user._id;
                res.redirect('/');
            } else {
                req.session.sessionFlash = {
                    type: 'alert alert-danger',
                    message: 'Parolanızı kontrol edip tekrar giriş yapınız.'
                }
                res.redirect('/users/login');
            }
        } else {
            req.session.sessionFlash = {
                type: 'alert alert-danger',
                message: 'Böyle bir email adresi bulunamamıştır. Lütfen kayıt olunuz.'
            }
            res.redirect('/users/register');
        }
    });
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

module.exports = router;