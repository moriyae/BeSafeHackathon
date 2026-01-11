// const express = require('express'); // חסר: ייבוא אקספרס
// const mongoose = require('mongoose'); // חסר: ייבוא מונגוס
// const cors = require('cors'); // חסר: ייבוא קורס
// const path = require('path');
// const dotenv = require('dotenv');

// // שלב 1: טעינה מפורשת עם נתיב מלא (הזזנו למעלה כדי שהמשתנים יהיו זמינים)
// const result = dotenv.config({ path: path.join(__dirname, '.env') });

// const app = express();

// // שלב 2: בדיקה אם הטעינה הצליחה או נכשלה
// console.log("--- בדיקת קובץ ENV ---");
// if (result.error) {
//     console.error("שגיאה בטעינת הקובץ:", result.error);
// } else {
//     console.log("הקובץ נטען בהצלחה!");
//     if (result.parsed) {
//         console.log("רשימת משתנים שנטענו:", Object.keys(result.parsed));
//     }
// }
// console.log("---------------------");

// // Middlewares
// app.use(express.json());
// app.use(cors({
//     origin: 'http://localhost:3000', // מאשר רק לקליינט שלך לגשת
//     credentials: true,               // מאפשר העברת Credentials
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     allowedHeaders: ['Content-Type', 'Authorization']
// }));

// //import routes links (הגדרנו פעם אחת בלבד)
// const authRoutes = require('./routes/auth');

// // שלב 3: התחברות ל-DB (שימי לב לשם המשתנה - ודאי שהוא זהה למה שכתוב ב-.env)
// const dbURI = process.env.MORIYA_DB;

// if (!dbURI) {
//     console.error("שגיאה: המשתנה MORIYA_DB לא נמצא בתוך ה-env!");
// } else {
//     mongoose.connect(dbURI)
//         .then(() => console.log("--- SUCCESS: db connected! ---"))
//         .catch(err => console.error("DB Connection Error:", err));
// }

// //check the server is working
// app.get('/api/auth/test', (req, res) => {
//     res.json({ message: "השרת עובד ומגיב!" });
// });

// // שימוש בראוטים
// app.use('/api/auth', authRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

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
app.use(cors({
    origin: 'http://localhost:3000', // מאשר רק לקליינט שלך לגשת
    credentials: true,               // מאפשר העברת Credentials
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

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));