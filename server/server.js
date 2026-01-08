const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()
const authRoutes = require('./routes/auth')
const app = express()

app.use(express.json())
app.use(cors())

//import routes links
mongoose.connect(process.env.MORIYA_DB).then(() => console.log("db connected!"))
.catch( (err) => console.error("connection error", err));

//use future routs

//check the server is working
app.get('/api/auth/test', (req, res) => {
    res.json({ message: "השרת עובד ומגיב!" });
});
app.use('/api/auth', authRoutes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`server running on port ${PORT}`));