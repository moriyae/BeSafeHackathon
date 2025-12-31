import ducks from '../data/duckData.js';
import User from '../models/User.js';
import { sendAlertEmail } from '../utils/emailService.js';
import mongoose from 'mongoose';

/**
 * Helper function to calculate daily distress score based on MCQ weights.
 */
const calculateDailyScore = (answers) => {
    const weights = { 1: 0, 2: 1, 3: 3, 4: 5 };
    return answers.reduce((total, ans) => total + (weights[ans] || 0), 0);
};

// 1. GET all ducks
const getAllDucks = (req, res) => {
    res.status(200).json({ ducks });
};

// 2. GET a random duck
const getRandomDuck = (req, res) => {
    const randomIndex = Math.floor(Math.random() * ducks.length);
    res.status(200).json(ducks[randomIndex]);
};

// 3. GET a single duck
const getSingleDuck = (req, res) => {
    const id = parseInt(req.params.id, 10);
    const duck = ducks.find(d => d.id === id);

    if (!duck) {
        return res.status(404).json({ mssg: "Duck not found" });
    }
    res.status(200).json({ duck });
};

// 4. CREATE a new duck (The Guardian Logic)
const createDuck = async (req, res) => {
    try {
        const { name, color, imageUrl, childId, answers } = req.body;
        
        console.log("--- New Request Received ---");

        // A. Save to local array (Original logic)
        const newDuck = {
            id: ducks.length ? ducks[ducks.length - 1].id + 1 : 1,
            name,
            color,
            imageUrl
        };
        ducks.push(newDuck);

        // B. Calculate score
        const dailyScore = calculateDailyScore(answers || []);
        
        // C. Find User in MongoDB
        const user = await User.findById(childId);

        if (!user) {
            console.log(" USER NOT FOUND");
            return res.status(404).json({ error: "User not found" });
        }

        // D. Calculate new counter value
        let newCounter = user.consecutive_low_emotions || 0;
        newCounter = (dailyScore >= 8) ? newCounter + 1 : 0;

        /**
         * E. Atomic Update with Validation Bypass
         * We use bypassDocumentValidation because the database schema has strict rules
         * that might block a partial update of just the counter.
         */
        const updatedUser = await User.findByIdAndUpdate(
            childId,
            { $set: { consecutive_low_emotions: newCounter } },
            { 
                new: true, 
                runValidators: true,
                bypassDocumentValidation: true 
            }
        );

        console.log("Counter updated to:", updatedUser.consecutive_low_emotions);

        // F. Trigger Email if counter reaches 7
        let alertSent = false;
        if (updatedUser.consecutive_low_emotions >= 7) {
            await sendAlertEmail(updatedUser.parent_info.parent_email, updatedUser.child_name);
            alertSent = true;
            console.log(" Email Sent to:", updatedUser.parent_info.parent_email);
        }

        res.status(201).json({ 
            duck: newDuck, 
            score: dailyScore, 
            currentCounter: updatedUser.consecutive_low_emotions,
            alertSent
        });

    } catch (error) {
        console.error('--- ERROR ---', error.message);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

// 5. DELETE a duck
const deleteDuck = (req, res) => {
    const id = parseInt(req.params.id, 10);
    const duckIndex = ducks.findIndex(d => d.id === id);

    if (duckIndex === -1) {
        return res.status(404).json({ mssg: "Duck not found" });
    }

    const [deletedDuck] = ducks.splice(duckIndex, 1);
    res.status(200).json({ duck: deletedDuck });
};

// 6. UPDATE a duck
const updateDuck = (req, res) => {
    const id = parseInt(req.params.id, 10);
    const duckIndex = ducks.findIndex(d => d.id === id);

    if (duckIndex === -1) {
        return res.status(404).json({ mssg: "Duck not found" });
    }

    const updatedDuck = { ...ducks[duckIndex], ...req.body };
    ducks[duckIndex] = updatedDuck;
    res.status(200).json({ duck: updatedDuck });
};

// Explicit exports for the router
export {
    getAllDucks,
    getRandomDuck,
    getSingleDuck,
    createDuck,
    deleteDuck,
    updateDuck
};