const ExcelJS = require("exceljs");
const axios = require("axios");
const nodemailer = require("nodemailer");

require('dotenv').config();

(async function generateEmailData() {
    const params = new URLSearchParams();
    params.set("grant_type", "client_credentials");
    params.set("client_id", process.env.client_id);
    params.set("client_secret", process.env.client_secret);
    params.set("scope", "squidex-api");

    const tokenData = await axios.post(
        "https://api.nmef.xyz/identity-server/connect/token",
        params,
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        }
    );

    const AUTH_TOKEN = tokenData.data.access_token;

    axios.defaults.baseURL =
        "https://api.nmef.xyz/api/content/nissanguidefordrivers";
    axios.defaults.headers.common["Authorization"] = "Bearer " + AUTH_TOKEN;
        
    
    let data

    try {
        const unpublishedData = await axios.get('/placed-order', {
            headers: {
                'X-Unpublished': '1'
            },
            params: {
                "$filter": "data/IsEmailSent/iv eq false"
            }
        })
        data = unpublishedData.data.items;
    } catch (err) {
        console.log(err);
    }

    const getVehicleData = (id) => {
        return axios.get(`/vehicle/${id}`);
    };

    const getItemsData = (ids) => {
        let proms = ids.map((id) => axios.get(`/accessories/${id}`));
        return proms;
    };

    const formatItems = async (items) =>
        items.map((item) => item.data.data.Name.en);

    const getFormattedData = async () => {
        let _data = await data.map(async (item) => {
            let extras = await Promise.all([
                getVehicleData(item.data.Vehicle.iv),
                getItemsData(item.data.Items.iv),
            ]);
            return {
                name: item.data.Name.iv,
                location: item.data.LocationName.iv,
                email: item.data.ContactEmail.iv,
                phone: item.data.ContactNumber.iv,
                vehicle: extras[0].data.data.name.iv,
                items: await formatItems(await Promise.all(extras[1])),
            };
        });
        return await Promise.all(_data);
    };

    getFormattedData().then((formattedData) => {
        const workbook = new ExcelJS.Workbook();

        workbook.creator = "Abdullah Al Jubaer";

        workbook.calcProperties.fullCalcOnLoad = true;

        workbook.views = [
            {
                x: 0,
                y: 0,
                width: 10000,
                height: 20000,
                firstSheet: 0,
                activeTab: 1,
                visibility: "visible",
            },
        ];

    const sheet = workbook.addWorksheet("Customer Data");
    let start = 1;

    formattedData.forEach((item, index) => {
        sheet.addRows([
            [index + 1, "Name", item.name],
            [index + 1, "Location", item.location],
            [index + 1, "Email", item.email],
            [index + 1, "Vehicle", item.vehicle],
            [index + 1, "Items", ...item.items],
        ]);
        sheet.mergeCells(`A${start}:A${start + 4}`);
        start = start + 5;
    });

    workbook.xlsx.writeFile("OrderData.xlsx").then(() => {
        console.log("File Created");
    });

        
    //mailId="lucas@maruboshi.nl"
        
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'leocollab01@gmail.com',
            pass: 'leocollab8!!'
        },
        /* tls: 
            { rejectUnauthorized: false } */
    });
    var mailOptions = {
        from: '"Test" <leocollab01@gmail.com>',
        to: 'sadman.sakib0008@gmail.com',
        subject: 'Sending Email Test',
        text: 'Hello!',
        html: '<b>Hello</b>',
        attachments: [{
            filename: "OrderData.xlsx",
            path: "D:/Work/nissan-email-service-master/OrderData.xlsx"
        }]
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return console.log(error);
        }
        else {
            return console.log('Email sent: ' + info.response);
        }
    });

});
}) ();


