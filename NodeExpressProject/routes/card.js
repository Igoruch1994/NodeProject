const Course = require("../models/course");
const {Router} = require('express');
const auth = require('../middleware/auth')
const router = Router();

function mapCartItems(cart) {
    return cart.items.map(c => ({
        ...c.courseId._doc,
        id: c.courseId._id,
        count: c.count
    }))
}

function calculatePrice(courses) {
    return courses.reduce((total, course) => {
        return total += course.price * course.count;
    }, 0)
}

router.post('/add', auth, async (req, res) => {
    const course = await Course.findById(req.body.id);
    await req.user.addToCart(course);
    res.redirect('/card');
})

router.get('/', auth, async (req, res) => {
    const user = await req.user.populate('cart.items.courseId')
        .execPopulate();

    const courses = mapCartItems(user.cart);

    res.render('card', {
        title: "Card",
        courses: courses,
        price: calculatePrice(courses),
        isCard: true
    })
})

router.delete('/remove/:id', auth, async (req, res) => {
    await req.user.removeFromCart(req.params.id);
    const user = await req.user.populate('cart.items.courseId').execPopulate();

    const courses = mapCartItems(user.cart);
    const cart = {
        courses,
        price: calculatePrice(courses)
    }

    res.status(200).json(cart);
})

module.exports = router;