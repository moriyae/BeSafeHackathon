const express = require('express');
const router = express.Router;
router.post('/register', authController.register);
router.post('/verify', authController.verify);
router.post('/login', authController.login);