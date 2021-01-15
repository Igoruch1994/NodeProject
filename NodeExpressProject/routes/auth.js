const {Router} = require('express');
const bCrypt = require('bcryptjs');
const User = require('../models/user');
const nodemailer = require('nodemailer');
const router = Router();
var xoauth2 = require('xoauth2');
var smtpTransport = require('nodemailer-smtp-transport');


router.get('/login', async (req, res) => {
    res.render('auth/login', {
        title: 'Authorization',
        isLogin: true,
        registerError: req.flash('registerError'),
        loginError: req.flash('loginError')
    })
})

router.get('/logout', async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login#login');
    })
})

router.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body;
        const candidate = await User.findOne( {email});
        if (candidate) {
            const areSame =  await bCrypt.compare(password, candidate.password);
            if (areSame) {
                req.session.user = candidate;
                req.session.isAuthenticated = true;
                req.session.save(err => {
                    if (err) {
                        throw err;
                    }
                    res.redirect('/')
                })
            } else {
                req.flash('loginError', "Password is invalid!")
                res.redirect('/auth/login#login');
            }
        } else {
            req.flash('loginError', "Email is invalid!")
            res.redirect('/auth/login#login');
        }
    } catch (e) {
        console.log(e);
    }


})

router.post('/register', async (req, res) => {
    try {
        const {email, password, repeat, name} = req.body;
        const candidate = await User.findOne({ email });
        if (candidate) {
            req.flash('registerError', 'User with this email already exists!')
            res.redirect('/auth/login#register')
        } else {
            const hashPassword = await bCrypt.hash(password, 10);
            const user = new User({
                email, name, password: hashPassword, cart: {items: []}
            });
            await user.save();
            res.redirect('/auth/login#login');
        }
    } catch (e) {
        console.log(e);
    }
})

router.post('/forgot', async (req, res) => {
    const output = `<h3>Hello it works! Congratulations!</h3>`;
    // // Generate test SMTP service account from ethereal.email
    // // Only needed if you don't have a real mail account for testing
    // //let testAccount = await nodemailer.createTestAccount();
    //
    // // create reusable transporter object using the default SMTP transport
    // let transporter = nodemailer.createTransport({
    //     host: "smtp.ethereal.email",
    //     port: 587,
    //     secure: false, // true for 465, false for other ports
    //     auth: {
    //         user: testAccount.user, // generated ethereal user
    //         pass: testAccount.pass, // generated ethereal password
    //     },
    // });
    //
    // // send mail with defined transport object
    // let info = await transporter.sendMail({
    //     from: '"Fred Foo 👻" <foo@example.com>', // sender address
    //     to: "igor.igruk@gmail.com", // list of receivers
    //     subject: "Hello ✔", // Subject line
    //     text: "Hello world?", // plain text body
    //     html: output, // html body
    // });
    //
    // console.log("Message sent: %s", info.messageId);
    // // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    //
    // // Preview only available when sending through an Ethereal account
    // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

try {
    var name = "Ihor";
    var from = "igor.igruk@gmail.com";
    //var message = req.body.message;
    var to = 'ihor.barduik@gmail.com';
    // var smtpTransport = nodemailer.createTransport("SMTP",{
    //     host: "smtp.gmail.com",
    //     auth: {
    //         type: "OAuth2",
    //         user: "igor.igruk@gmail.com",
    //         clientId: "133127143301-h2s21b5o5s3g50557n6al9nnrukanv14.apps.googleusercontent.com",
    //         clientSecret: "71HDMIF7_AfH0HCtGa4BSQ1s",
    //     }
    // });

    // var smtpTransport = nodemailer.createTransport({
    //     service: 'Gmail',
    //     host: "smtp.gmail.com",
    //     auth: {
    //         xoauth2: xoauth2.createXOAuth2Generator({
    //             ype: "OAuth2",
    //             user: "igor.igruk@gmail.com",
    //             clientId: "133127143301-h2s21b5o5s3g50557n6al9nnrukanv14.apps.googleusercontent.com",
    //             clientSecret: "71HDMIF7_AfH0HCtGa4BSQ1s",
    //         })
    //     }
    // });

    var smtpTransport =  nodemailer.createTransport({
        host: "smtp.gmail.com",
        auth: {
            type: "OAuth2",
            user: "igor.igruk@gmail.com",
            clientId: "133127143301-h2s21b5o5s3g50557n6al9nnrukanv14.apps.googleusercontent.com",
            clientSecret: "71HDMIF7_AfH0HCtGa4BSQ1s",
            refreshToken: "REFRESH_TOKEN_HERE"
        }
    });


    var mailOptions = {
        from: from,
        to: to,
        subject: name +' | new message !',
        ext: "Hello world?", // plain text body
        html: output, // html body
    }
    await smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
        }else{
            res.redirect('/auth/login#login');
        }
    });
} catch (e) {
    console.log(e);
}

})

module.exports = router;