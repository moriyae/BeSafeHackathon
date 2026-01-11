const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const tokenHeader = req.header('Authorization');

    if (!tokenHeader) {
        return res.status(401).json({ message: "Access Denied: No Token Provided!" });
    }

    try {
        const token = tokenHeader.split(" ")[1]; 
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'secretKey');

        // שמירת המידע שחולץ (extracted) בתוך req.user
        req.user = verified; 
        
        // הדפסת בדיקה - כאן תראי שה-ID באמת יצא מהטוקן
        console.log("MIDDLEWARE DEBUG: Token verified for user ID:", req.user.id);

        next(); 

    } catch (err) {
        // שימוש ב-err פותר את שגיאת ה-Lint ומדפיס לך למה זה נכשל
        console.error("MIDDLEWARE DEBUG: Verification failed:", err.message);
        res.status(400).json({ message: "Invalid Token" });
    }
};