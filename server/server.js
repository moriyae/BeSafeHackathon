const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// תיקון לבעיות SSL אם יש
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// שלב 1: טעינה מפורשת של משתני הסביבה
const result = dotenv.config({ path: path.join(__dirname, '.env') });

console.log("--- בדיקת קובץ ENV ---");
if (result.error) {
    console.error("שגיאה בטעינת הקובץ:", result.error);
} else {
    console.log("הקובץ נטען בהצלחה!");
}
console.log("---------------------");

const app = express();
app.use(express.json());
<<<<<<< HEAD

// הגדרות CORS - מאפשר לקליינט לדבר עם השרת
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
=======
// app.use(cors({
//     origin: ['http://localhost:3000', 'http://localhost:3001'], // מאשר רק לקליינט שלך לגשת
//     credentials: true,               // מאפשר העברת Credentials
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     allowedHeaders: ['Content-Type', 'Authorization']
// }));
app.use(cors({
    // אנחנו לוקחים את הכתובת מה-env (שם רשמת 3001)
    origin: process.env.CLIENT_URL, 
>>>>>>> origin/main
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// שלב 3: התחברות ל-DB
const dbURI = process.env.MORIYA_DB;

if (!dbURI) {
    console.error("שגיאה: המשתנה MORIYA_DB לא נמצא בתוך ה-env!");
} else {
    mongoose.connect(dbURI)
        .then(() => console.log("--- SUCCESS: db connected! ---"))
        .catch(err => console.error("DB Connection Error:", err));
}
<<<<<<< HEAD

// חיבור הראוטים (Routes)
=======
//every request starting with api/auth -> move to routes
>>>>>>> origin/main
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

