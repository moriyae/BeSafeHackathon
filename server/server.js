const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
cosnt 

// שלב 1: טעינה מפורשת עם נתיב מלא
const result = dotenv.config({ path: path.join(__dirname, '.env') });

// שלב 2: בדיקה אם הטעינה הצליחה או נכשלה
console.log("--- בדיקת קובץ ENV ---");
if (result.error) {
    console.error("שגיאה בטעינת הקובץ:", result.error);
} else {
    console.log("הקובץ נטען בהצלחה!");
    console.log("רשימת משתנים שנטענו:", Object.keys(result.parsed));
}
console.log("---------------------");

const app = express();
app.use(express.json());
// app.use(cors({
//     origin: ['http://localhost:3000', 'http://localhost:3001'], // מאשר רק לקליינט שלך לגשת
//     credentials: true,               // מאפשר העברת Credentials
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     allowedHeaders: ['Content-Type', 'Authorization']
// }));
app.use(cors({
    // אנחנו לוקחים את הכתובת מה-env (שם רשמת 3001)
    origin: process.env.CLIENT_URL, 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// שלב 3: התחברות ל-DB (שימי לב לשם המשתנה - ודאי שהוא זהה למה שכתוב ב-.env)
const dbURI = process.env.MORIYA_DB;

if (!dbURI) {
    console.error("שגיאה: המשתנה MORIYA_DB לא נמצא בתוך ה-env!");
} else {
    mongoose.connect(dbURI)
        .then(() => console.log("--- SUCCESS: db connected! ---"))
        .catch(err => console.error("DB Connection Error:", err));
}
//every request starting with api/auth -> move to routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

