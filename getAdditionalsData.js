const ExcelJS = require("exceljs");
const axios = require("axios");
if (process.env.NODE_ENV === "development") {
    require("dotenv").config();
}

exports.generateEmailData = async function () {
    let data;
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

    try {
        const unpublishedData = await axios.get("/placed-order", {
            headers: {
                // "X-Unpublished": "1",
            },
            params: {
                // $filter: "data/IsEmailSent/iv eq false",
            },
        });
        data = unpublishedData.data.items;
        console.log(data.length);
    } catch (err) {
        console.log("Error to get the place order data");
        data = [];
    }

    const getVehicleData = (id) => {
        console.log(id);
        return axios.get(`/vehicle/${id}`);
    };

    const getItemsData = (ids) => {
        let proms = ids.map((id) => axios.get(`/accessories/${id}`));
        return proms;
    };

    const formatVehicle = async (item) => {
        if (item) return item.data.data.name.iv;
        return "No vehicle";
    };

    const formatItems = async (items) => items.map((item) => item.data.data.Name.en);

    const getFormattedData = async () => {
        let _data = await data.map(async (item) => {
            if (item) {
                let vehicleDetails, accessoriesDetails, formattedAccessories;
                try {
                    vehicleDetails = await getVehicleData(item.data.Vehicle.iv);
                } catch (error) {
                    console.log("Error on getting vehicle data");
                }
                try {
                    accessoriesDetails = await getItemsData(item.data.Items.iv);
                } catch (error) {
                    console.log("Error on getting accessories data");
                }
                try {
                    formattedAccessories = await formatItems(
                        await Promise.all(accessoriesDetails)
                    )
                } catch (error) {
                    console.log('Error on formatting accessories');
                    formattedAccessories = [];
                }
                return {
                    name: item.data.Name.iv,
                    location: item.data.LocationName.iv,
                    email: item.data.ContactEmail.iv,
                    phone: item.data.ContactNumber.iv,
                    vehicle: formatVehicle(vehicleDetails),
                    items: formattedAccessories,
                };
            } else {
                return {
                    name: '',
                    location: '',
                    email: '',
                    phone: '',
                    vehicle: '',
                    items: [],
                };
            }
        });
        return await Promise.all(_data);
    };

    let receivers = await axios.get("/accessories-location-email");
    receivers = receivers.data.items.map((receiver) => receiver.data.Email.iv);

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
    });
    return { data, receivers };
};

exports.updateData = async (data) => {
    let res = await data.map(async (item) => {
        try {
            let publishedItem = await axios.put(
                `/placed-order/${item.id}/status/`,
                {
                    Status: "Published",
                },
                {
                    headers: {
                        "X-Unpublished": "1",
                    },
                }
            );
            const dataToUpdate = {
                ...publishedItem.data.data,
                IsEmailSent: {
                    iv: true,
                },
            };
            let updatedData = await axios.put(
                `/placed-order/${item.id}/`,
                dataToUpdate,
                {
                    headers: {
                        "X-Unpublished": "1",
                    },
                }
            );
            return { status: "success", updatedData };
        } catch (error) {
            console.log("error");
            return { status: "failed", error };
        }
    });
    return await Promise.all(res);
};