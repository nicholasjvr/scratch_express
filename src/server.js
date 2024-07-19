const express = require('express')
const path = require('path')
const app = express();

const staticPath = path.join(__dirname, '../public')
console.log(staticPath);

app.use(express.static(staticPath))

app.get('/status/:leadId', function (req, res) {
    // Prepare output in JSON format
    const leadId = req.params.leadId;
    // Perform your logic with the leadId here
    res.send(`Status for leadId: ${leadId}`);
    console.log(leadId); 
    // Send the usersList as a response to the client
 })

app.listen(8000, () => {
    console.log("Port Running On 8000")
})

