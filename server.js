const express = require('express');
const app = express();

const additionalData = require('./getAdditionalsData');
const emailSender = require('./sendEmail');

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
	res.sendStatus(200);
});

app.get('/sendEmail', async (req, res) => {
	let receivedData;
	try {
		receivedData = await additionalData.generateEmailData();
	} catch (error) {
		res.status(500).json({ error: "Failed collect data" });
		return;
	}

	// Todo: use receivedData.formattedData
	// Structure am HTML for email body
	// Attach the HTML to the email body 

	emailSender.sendEmail(receivedData.receivers, (error, response) => {
		if (error) {
			res.status(500).json({ error: "Failed to send email" });
		} else {
			// const updatedData = await emailData.updateData(unpublishedData);
			res.status(200).json({ message: response, data: receivedData.formattedData });
		}
	});
});

app.listen(PORT, () => {
	console.log('===========================');
	console.log('APP IS RUNNING ON PORT ' + PORT);
	console.log('===========================');
});
