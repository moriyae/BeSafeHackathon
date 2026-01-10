process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// שלב 1: טעינה מפורשת עם נתיב מלא
const result = dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// שלב 2: בדיקה אם הטעינה הצליחה או נכשלה
console.log("--- בדיקת קובץ ENV ---");
if (result.error) {
    console.error("שגיאה בטעינת הקובץ:", result.error);
} else {
    console.log("הקובץ נטען בהצלחה!");
    if (result.parsed) {
        console.log("רשימת משתנים שנטענו:", Object.keys(result.parsed));
    }
}
console.log("---------------------");

// Middlewares
app.use(express.json());

// --- התיקון נמצא כאן ---
app.use(cors({
    // נותן אישור לכל הפורטים הנפוצים של ריאקט
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// -----------------------

// ייבוא הראוטים
const authRoutes = require('./routes/auth');

// שלב 3: התחברות ל-DB
const dbURI = process.env.MORIYA_DB;

if (!dbURI) {
    console.error("שגיאה: המשתנה MORIYA_DB לא נמצא בתוך ה-env!");
} else {
    mongoose.connect(dbURI)
        .then(() => console.log("--- SUCCESS: db connected! ---"))
        .catch(err => console.error("DB Connection Error:", err));
}

// בדיקת שרת
app.get('/api/auth/test', (req, res) => {
    res.json({ message: "השרת עובד ומגיב!" });
});

// שימוש בראוטים
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));