const express = require('express');
const app = express();

const additionalData = require('./getAdditionalsData');
const emailSender = require('./sendEmail');

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
	res.sendStatus(200);
});

app.get('/sendEmail', async (req, res) => {
	let data, receivers;
	try {
		[ data, receivers ] = await additionalData.generateEmailData();
	} catch (error) {
		res.status(500).json({ error: "Failed collect data" });
		return;
	}
	console.log(receivers);
	emailSender.sendEmail(receivers, (error, response) => {
		if (error) {
			res.status(500).json({ error: "Failed to send email" });
		} else {
			// const updatedData = await emailData.updateData(unpublishedData);
			res.status(201).json({ message: response, data });
		}
	});
});

app.listen(PORT, () => {
	console.log('===========================');
	console.log('APP IS RUNNING ON PORT ' + PORT);
	console.log('===========================');
});
