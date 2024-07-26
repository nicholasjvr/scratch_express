const express = require('express')
const path = require('path')
const app = express();
const axios = require('axios');
let accessToken = '1000.980eb6c2fbbd7b9aa22aba301a37b3db.c9de1a1aaab9bf51790c77daa93b8174';
const TOKEN_EXPIRATION_TIME = 60 * 60 * 1000; // e.g., 1 hour

const accountUrl = 'https://accounts.zoho.com'


const staticPath = path.join(__dirname, '../public')
console.log(staticPath);

app.use(express.static(staticPath))

const refreshToken = async () => {
    const refresh_token = '1000.500ceb92badc8a2c9ddb04f38d2d9738.5ea7af8e25020e3af0880a7754bd8a25';
    const client_id = '1000.YJ99QF288RQVHN4THYB5V5KU5RA71A';
    const client_secret = '4ae6844763df9f498aacc45e593732d5dc70922d10';
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
        console.log(error)
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
            ]
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
setInterval(refreshToken, TOKEN_EXPIRATION_TIME - (5 * 60 * 1000)); // Refresh 5 minutes before expiration


app.listen(8000, () => {
    console.log("Port Running On 8000")
})






