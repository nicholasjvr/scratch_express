const express = require('express')
const path = require('path')
const app = express();

const staticPath = path.join(__dirname, '../public')
console.log(staticPath);

app.use(express.static(staticPath))

app.get('/token', (req,res) => {
    res.send('Login Move Forward')
})

app.get('/status' , (req,res) => {
    res.send('Profile Page')
})

app.get('/feedPage' , (req,res) => {
    res.send('Feed Page')
})

app.listen(8000, () => {
    console.log("Port Running On 8000")
})
