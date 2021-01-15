const express = require('express');
const path = require('path');
const csrf = require('csurf');
const exhbs = require('express-handlebars');
const session = require('express-session');
const flash = require('connect-flash');
const MongoStore = require('connect-mongodb-session')(session);

const homeRoutes = require('./routes/home');
const addRoutes = require('./routes/add');
const coursesRoutes = require('./routes/courses');
const authRoutes = require('./routes/auth');
const cardRoutes = require('./routes/card');
const ordersRoutes = require('./routes/orders');
const mongoose = require('mongoose');
const Handlebars = require('handlebars');
const varMiddleware = require('./middleware/variables');
const userMiddleware = require('./middleware/user');
const keys = require('./keys');


const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');

const app = express();
const hbs = exhbs.create({
    defaultLayout: 'main',
    extname: 'hbs',
    handlebars: allowInsecurePrototypeAccess(Handlebars)
})

const store = new MongoStore({
    collection: 'sessions',
    uri: keys.MONGODB_URI
})

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}))
app.use(session({
    secret: keys.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store
}));
app.use(csrf());
app.use(flash());
app.use(varMiddleware);
app.use(userMiddleware);

app.use('/', homeRoutes);
app.use('/add', addRoutes);
app.use('/courses', coursesRoutes);
app.use('/card', cardRoutes);
app.use('/orders', ordersRoutes);
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 3000;

async function start() {
    try {
        await mongoose.connect(keys.MONGODB_URI, {
            useUnifiedTopology: true,
            useFindAndModify: false,
            useNewUrlParser: true
        });
        app.listen(3000, () => {
            console.log(`Server is running on port: ${PORT}`)
        })
    } catch (e) {
        console.log(e);
    }
}

start();


