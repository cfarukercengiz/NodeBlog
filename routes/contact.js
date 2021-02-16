const express = require('express');
const router = express.Router();

router.post('/sendEmail', (req, res) => {
    const outputHTML = `
    <h2>Mail Details</h2>
    <ul>
        <li>Name : ${req.body.name}</li>
        <li>Email : ${req.body.email}</li>
        <li>Phone : ${req.body.phone}</li>
    </ul>
    <h3>Message</h3>
    <p>${req.body.message}</p>`


    "use strict";
    const nodemailer = require("nodemailer");

    // async..await is not allowed in global scope, must use a wrapper
    async function main() {
        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing
        let testAccount = await nodemailer.createTestAccount();

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: 'youremail@gmail.com', // generated ethereal user
                pass: 'yourpassword', // generated ethereal password
            },
        });

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: '"NodeDemo Proje Contact Form" <youremail@gmail.com>', // sender address
            to: "youremail@gmail.com", // list of receivers
            subject: "NodeDemo Contact Message", // Subject line
            text: "Hello world?", // plain text body
            html: outputHTML // html body
        });

        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

        req.session.sessionFlash = {
            type: 'alert alert-success',
            message: 'Mesajınız başarılı bir şekilde gönderildi.'
        }

        res.redirect('/contact');
    }

    main().catch(console.error);
});

module.exports = router;