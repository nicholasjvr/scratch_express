const express = require('express')
require('dotenv').config();
const path = require('path')
const app = express();
const axios = require('axios');
const TOKEN_EXPIRATION_TIME = 60 * 60 * 1000; // e.g., 1 hour
let accessToken = process.env.ACCESS_TOKEN;
const refresh_token = process.env.REFRESH_TOKEN;
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;



const accountUrl = 'https://accounts.zoho.com'


const staticPath = path.join(__dirname, '../public')
console.log(staticPath);

app.use(express.static(staticPath))

const refreshToken = async () => {
    const config = {
        method: 'POST',
        url: `https://accounts.zoho.com/oauth/v2/token?refresh_token=${refresh_token}&client_id=${client_id}&client_secret=${client_secret}&grant_type=refresh_token`
    };

    try {
        const response = await axios(config);
        console.log("REFRESH TOKEN", response);
        accessToken = response.data.access_token;
        console.log("Access Token" + accessToken);
    } catch (error) {
        console.log(error);
        throw error;
    }
    
};

const checkLead = async (leadId) => {
    const config = {
        method: 'GET',
        url: `https://www.zohoapis.com/crm/v6/Leads/${leadId}`,
        headers: { 
            'Authorization': `Zoho-oauthtoken ${accessToken}`
        }
    };

    try {
        const response = await axios(config);
        console.log("Lead Response" + JSON.stringify(response.data.data[0].hasScratched));
        let hasScratched = JSON.stringify(response.data.data[0].hasScratched);
        return hasScratched;
    } catch (error) {
        console.log("ERROR", error);
        //refreshToken();
        return error;

    }
    
};

const updateLead = async (leadId) => {
    const config = {
        method: 'PUT',
        url: `https://www.zohoapis.com/crm/v6/Leads/${leadId}`,
        headers: { 
            'Authorization': `Zoho-oauthtoken ${accessToken}`
        },
        data: {
            'data': [
                {
                    'hasScratched': true
                }
            ],
            'trigger': ['workflow']
            }
    };

    try {
        const response = await axios(config);
        console.log("Lead Response update lead" + JSON.stringify(response.data));
    } catch (error) {
        console.log("ERROR", error);
    }
    
};
//Fetch Lead
app.get('/status/:leadId', async function (req, res) {
    // Get Lead Id
    const leadId = req.params.leadId;
    let hasScratched = await checkLead(leadId);
    res.set('Content-Type', 'application/json');
    res.send({"hasScratched": hasScratched});
 })

 //Update Lead
 app.post('/status/:leadId', async function (req, res) {
    // Get Lead Id
    const leadId = req.params.leadId;
    updateLead(leadId);
    console.log("LeadId to update" + leadId); 
    res.set('Content-Type', 'application/json');
    res.send({"hasScratched": true});
 })


//setInterval(refreshToken, 2);
setInterval(refreshToken, TOKEN_EXPIRATION_TIME - (10 * 60 * 1000)); // Refresh 5 minutes before expiration


app.listen(8000, () => {
    console.log("Port Running On 8000")
})






