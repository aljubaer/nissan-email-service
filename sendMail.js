const nodemailer = require('nodemailer');
require('dotenv').config();

exports.sendMail = function (receivers, data) {
	let transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.email_user,
			pass: process.env.email_password,
		},
	});

	// setup email data with unicode symbols
	let mailOptions = {
		from: '"Fred Foo 👻" <bs23@gmail.com> ', // sender address
		to: 'moshi.bs23@gmail.com', // list of receivers
		subject: 'Node Contact Request', // Subject line
		text: 'Hello world?', // plain text body
		// html: `<h1>TEST</h1>`, // html body
	};

	// send mail with defined transport object
	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.log(error.message);
		} else {
			console.log('email sent');
		}
	});
};
