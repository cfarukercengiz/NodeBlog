const express = require('express');
const mongoose = require('mongoose');
const expressSession = require('express-session');
const connectMongo = require('connect-mongo');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const { generateDate, limit, truncate, paginate } = require('./helpers/hbs')
const methodOverride = require('method-override');

const app = express();
const hostname = '127.0.0.1';
const port = 3000;

//Mongodb (with mongoose) bağlantısı
mongoose.connect('mongodb://127.0.0.1/nodedemo_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
});

//Sessionlarımızı mongodb veritabanına kaydetmek için
const mongoStore = connectMongo(expressSession);

//Session oluşturma
app.use(expressSession({
    secret: 'nodedemotest',
    resave: false,
    saveUninitialized: true,
    store: new mongoStore({ mongooseConnection: mongoose.connection })
}));

//Handlebars Helpers
const hbs = exphbs.create({
    helpers: {
        generateDate: generateDate,
        limit: limit,
        truncate: truncate,
        paginate: paginate
    }
});

//Handlebars eklemesi (index,about,contact ve header,footer sayfa bölmeleri)
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

//Postumuza image eklemek için
app.use(fileUpload());

//Statik dosya ekleme (css,js,images dosyları)
app.use(express.static('public'));

// override with POST having ?_method=DELETE
app.use(methodOverride('_method'));

//Display Link Middleware
app.use((req, res, next) => {
    const { userId } = req.session;
    if (userId) {
        res.locals = {
            displayLink: true
        }
    } else {
        res.locals = {
            displayLink: false
        }
    }
    next();
});

//Flash - Message Middleware
app.use((req, res, next) => {
    res.locals.sessionFlash = req.session.sessionFlash;
    delete req.session.sessionFlash;
    next();
});

//Sayfalara yönlendirme işlemi
const main = require('./routes/main');
const posts = require('./routes/posts');
const users = require('./routes/users');
const admin = require('./routes/admin/index');
const contact = require('./routes/contact');
app.use('/', main);
app.use('/posts', posts);
app.use('/users', users);
app.use('/admin', admin);
app.use('/contact', contact);




app.listen(port, hostname, () => {
    console.log(`Server Çalışıyor,http://${hostname}:${port}/`);
});