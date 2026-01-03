const User = require("../models/User");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({service:'gmail',
    auth: {
        user: process.env.OUR_EMAIL,
        password: process.encv.OUR_EMAIL_PASS
    }
});

exports.register = async(req, res) => {
    try{
        const {username, password, child_email, parent_email} = req.body;
        const the_user = await User.findOne({username});
        if (the_user) return res.status(400).json(({msg: "User already exist"}));
        //hashing the password in the first place
        const hashed_pass = await bcrypt.hash(password,10);
        const code = Math.floor(100000  + Math.random() * 900000).toString();
        //if user not found create the user
        const newUser = await User.create({
            username,
            password: hashed_pass,
            child_email,
            parent_email,
            isVerified : false,
            Verification_code : code
        });
        console.log('sending email to parent with the email ${parent_email} with code ${code}');

        const mailOptions = {
            from: 'Be safe team ',
            to: parent_email,
            subject: 'Verify your childs Be Safe account',
            html: 
            `<h3>Welcome to BeSafe!</h3>
            <p>Your child <b>${username}</b> wants to create an account.</p>
            <p>Please provide them with this verification code:</p>
            <h1 style="color: blue;">${code}</h1>
            <p>If you did not request this, please ignore this email.</p>`
        };
        await transporter.sendMail(mailOptions);
        console.log(`sent mail to parent user ${parent_email} with code ${code}`);
        //show successful msg
        res.status(201).json({msg: "User created! please check you parents email for verification code"});
    }
    catch(error){
        res.status(500).json({error: error.message});
    }
};
//assuming the parent received the code and the child is going to enter it
exports.verify = async(req,res) => {
    try{
        //the username that 
        const {username, guess_code} = req.body;
        //another check because the server has no memory so it does not rememebr the checks
        //whether the username is valid
        const the_user = await User.findOne({username});
        if (the_user) return res.status(400).json(({msg: "User already exist"}));
        if (the_user.Verification_code!= guess_code){
            return res.status(400).json({msg: "wrong code!"});
        }
        //if the code is correct, verify the parent-child pair
        the_user.isVerified = true;
        the_user.Verification_code = null; //according to gimini we must clean
        await the_user.save();
        //log the parent-child pair using JWT. user._id is received from MongoDB automatically
        //*THE SECRET PART IS FROM GIMINI I STILL DONT UNDERSTAND IT COMPLETELY
        const token = jwt.sign({id : the_user._id}, process.env.JWT_SECRET || 'secretKey', { expiresIn: '1d' });
        res.json({msg: "verified", token});
    }
    catch(error){
        res.status(500).json({error: error.message});
    }
};
//now we finished the registration form. starting with regular login
exports.login = async(req,res) => {
    try{
        const {username, password} = req.body;
        if (!the_user)return res.status(400).json('user invalid');
        const the_user = await User.findOne({username});
        if (the_user) return res.status(400).json(({msg: "User already exist"}));
        if (!the_user.isVerified) return res.status(400).json({msg: "user is not verified"});
        //if it is veri
        //we cannot turn the encryption backwards but we can check if the password gives the same enctyption
        const isMatch = await bcrypt.compare(password, the_user.password);
        if (!isMatch) return res.status(400).json({msg: "invalid password"});
        const token = jwt.sign({ id: the_user._id, role: the_user.role }, process.env.JWT_SECRET || 'secretKey', { expiresIn: '1d' });
        res.json({ token, role: the_user.role });  
    } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
