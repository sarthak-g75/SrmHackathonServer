const express = require('express')
const app  = express();
const port = 5000
const connectToMongo = require('./connectToMongo');
connectToMongo();
app.use(express.json()) 
app.use('/api/auth',require('./routes/auth')) 
app.listen(port , ()=>{
    console.log('app listening to http://localhost:5000');
})