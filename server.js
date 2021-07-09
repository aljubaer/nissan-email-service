const express = require('express');
const app = express();

const emailData = require('./createExcel');
const emailSender = require('./sendEmail');

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
	res.sendStatus(200);
});

app.post('/sendEmail', async (req, res) => {
	const unpublishedData = await emailData.generateEmailData();
	emailSender.sendEmail(async (error, response) => {
		if (error) {
			res.status(500).json({ ...error });
		} else {
			const updatedData = await emailData.updateData(unpublishedData);
			res.status(201).json({ message: response, data: updatedData });
		}
	});
});

app.listen(PORT, () => {
	console.log('===========================');
	console.log('APP IS RUNNING ON PORT ' + PORT);
	console.log('===========================');
});
