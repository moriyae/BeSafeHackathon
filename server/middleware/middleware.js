const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const tokenHeader = req.header('Authorization');

    if (!tokenHeader) {
        return res.status(401).json({ message: "Access Denied: No Token Provided!" });
    }

    try {
        const token = tokenHeader.split(" ")[1]; 
        
        if (!process.env.JWT_SECRET) throw new Error("Missing JWT_SECRET in environment");

        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; 
        next(); 

    } catch (err) {
        console.error("Middleware Verification Failed:", err.message);
        res.status(400).json({ message: "Invalid Token" });
    }
};