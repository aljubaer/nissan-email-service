const nodemailer = require('nodemailer');
require('dotenv').config();

exports.sendEmail = function (cb) {
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.email_user,
			pass: process.env.email_password,
		},
	});
	const mailOptions = {
		from: '"Sales" <leocollab01@gmail.com>',
		// to: "lucas@maruboshi.nl",
		to: 'shozonyrose@gmail.com',
		subject: 'New Order!!!',
		text: 'There are some new orders from website.',
		attachments: [
			{
				filename: 'OrderData.xlsx',
				path: __dirname + '/OrderData.xlsx',
			},
		],
	};
	transporter.sendMail(mailOptions, function (error, info) {
		if (error) {
			cb(error, null);
		} else {
			cb(null, info.response);
		}
	});
};
