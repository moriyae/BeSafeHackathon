const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const app = express()
app.use(express.json())
app.use(cors())

//import routes links
mongoose.connect(process.env.MORIYA_DB).then( () => console.log("db connected!")})

//use future routs
//app.use 

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`server running on port ${PORT}`));