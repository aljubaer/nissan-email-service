const nodemailer = require("nodemailer");
require("dotenv").config();

exports.sendEmail = function (receivers, data, cb) {
    let outPut = `
	<h1>New Order</h1>
	<table style="border-collapse: collapse;">
		<tr>
			<th style="border: 1px solid #dddddd;text-align: left; padding: 8px; ">Serial</th>
			<th style="border: 1px solid #dddddd;text-align: left; padding: 8px; ">Name</th>
			<th style="border: 1px solid #dddddd;text-align: left; padding: 8px; ">Location</th>
			<th style="border: 1px solid #dddddd;text-align: left; padding: 8px; ">Email</th>
			<th style="border: 1px solid #dddddd;text-align: left; padding: 8px; ">Phone</th>
			<th style="border: 1px solid #dddddd;text-align: left; padding: 8px; ">Vehicle</th>
			<th style="border: 1px solid #dddddd;text-align: left; padding: 8px; ">Items</th>
		</tr>
		${data.map((item, index) => {
            console.log(item);
            return `
			<tr>
			<td style="border: 1px solid #dddddd;text-align: left; padding: 8px;  border-collapse: collapse;">${
                index + 1
            }</td>
			<td style="border: 1px solid #dddddd;text-align: left; padding: 8px; border-collapse: collapse;">${
                item.name
            }</td>
			<td style="border: 1px solid #dddddd;text-align: left; padding: 8px; border-collapse: collapse;">${
                item.location
            }</td>
			<td style="border: 1px solid #dddddd;text-align: left; padding: 8px; border-collapse: collapse;">${
                item.email
            }</td>
			<td style="border: 1px solid #dddddd;text-align: left; padding: 8px; border-collapse: collapse;">${
                item.phone
            }</td>
			<td style="border: 1px solid #dddddd;text-align: left; padding: 8px; border-collapse: collapse;">${
                item.vehicle
            }</td>
			<td style="border: 1px solid #dddddd;text-align: left; padding: 8px; border-collapse: collapse;">
				${item.items.map((i) => {
                    return `
						${i}`;
                })}
			</td>
		</tr>
			`;
        })}
	</table>
	`;
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.email_user,
            pass: process.env.email_password,
        },
    });
    const mailOptions = {
        from: '"Sales" <leocollab01@gmail.com>',
        to: receivers.join(),
        // to: 'jubaer.bs23@gmail.com',
        subject: "NISSAN Driver's Guide NMEF - New Accessories Order!!!",
        text: "There are some new orders from website.",
        html: outPut,
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error.message);
            cb(error, null);
        } else {
            console.log("Email sent", new Date());
            cb(null, info.response);
        }
    });
};
