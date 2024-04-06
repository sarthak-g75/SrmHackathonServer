const express = require('express')
const router = express.Router();
const User = require('../models/User')
const Batallion = require('../models/Battalion')
const Crate = require("../models/Crate")
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const jwtSec = 'S@rth@KI$Th3B3$t'
const authMiddleware = require('../middleware/fetchUser')

router.post('/create-user', async (req, res) => {
    try {
        const { role, name, password , email } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        let newUser = new User({
            email:email,
            role:role,
            name: name,
            password: hashedPassword
        });
        const savedUser = await newUser.save();
        const token = jwt.sign(
            { userId: savedUser._id, name: savedUser.name, role: savedUser.role },
            jwtSec,
        );

        // Sending success response with token
        res.status(201).json({ success: true, message: 'User created successfully', token });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Api to add Batallion 
router.put('/add-batallion', authMiddleware,async (req, res) => {
    const { name } = req.body;
    const { _id } = req.user;

    try {
        // console.log(req.user)
        // Find the user by ID
        const user = await User.findById(_id);
        // console.log(typeof userId)

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Create a new battalion
        const newBattalion = new Batallion({ name: name, admin: user._id });
        await newBattalion.save();

        // Push the battalion ID into the battalions array of the user
        user.batallions.push(newBattalion._id);

        // Save the updated user document
        await user.save();

        res.status(200).json({ success: true, message: 'Battalion added successfully', user });
    } catch (error) {
        console.error('Error adding battalion:', error);
        res.status(500).json({ success: false, error: error.message});
    }
});

// Api to add new crate and assign it to a battalion
router.put('/add-crate/:batallionId', authMiddleware, async (req, res) => {
    const { type, name, weight } = req.body;
    const batallionId = req.params.batallionId;
    const userId = req.user._id; // Assuming req.user holds the logged-in user's document

    try {
        // Check if the battalion exists
        const batallion = await Batallion.findById(batallionId);
        if (!batallion) {
            return res.status(400).json({ success: false, message: "Failed to find the battalion" });
        }

        // Create a new crate
        const newCrate = new Crate({ name, type, weight, battalion: batallionId , access: userId});
        await newCrate.save();

        // Update user's crates
        await User.findByIdAndUpdate(userId, { $push: { crates: newCrate._id } });

        // Update battalion's crates
        await Batallion.findByIdAndUpdate(batallionId, { $push: { crate: newCrate._id } });

        return res.status(200).json({ success: true, message: "Crate added successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// Api to get the data 
router.get('/get-data',authMiddleware , async(req,res)=>{
    return res.status(200).json({success: true , user: req.user})
})
// Api to login 
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if password is correct
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ success: false, message: 'Invalid password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, name: user.name, role: user.role },
            jwtSec
        );

        // Send success response with token
        res.status(200).json({ success: true, message: 'Login successful', token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
// Api to change the status;
router.put('/update-status/:crateId', authMiddleware, async (req, res) => {
    try {
        const { crateId } = req.params;
        
        // Find the crate by ID
        const crate = await Crate.findById(crateId);
        
        // Check if the crate exists
        if (!crate) {
            return res.status(404).json({ success: false, message: 'Crate not found' });
        }

        // Update the crate status to 'active'
        crate.status = 'active';
        
        // Save the updated crate to the database
        await crate.save();

        res.status(200).json({ success: true, message: 'Crate status updated successfully', crate });
    } catch (error) {
        console.error('Error updating crate status:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Api to chagne the reinforcement
router.put('/update-reinforcement/:crateId', authMiddleware, async (req, res) => {
    try {
        const { crateId } = req.params;
        
        // Find the crate by ID
        const crate = await Crate.findById(crateId);
        
        // Check if the crate exists
        if (!crate) {
            return res.status(404).json({ success: false, message: 'Crate not found' });
        }

        // Update the crate status to 'active'
        crate.reinforcement = true;
        
        // Save the updated crate to the database
        await crate.save();

        res.status(200).json({ success: true, message: 'Crate reinforcement updated successfully', crate });
    } catch (error) {
        console.error('Error updating crate status:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Api to get Batallion details;
router.get('/get-batallions',authMiddleware , async(req,res)=>{
    try {
        const userId = req.user.id;

        // Fetch the user document from the database
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Extract battalion IDs from the user's battalions array
        const battalionIds = user.batallions;
        const battalions = await Batallion.find({ _id: { $in: battalionIds } });

        res.status(200).json({ battalions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
})
router.put('/update-crate/:crateId', async (req, res) => {
    const { weight } = req.body;
    const crateId = req.params.crateId;

    try {
        const crate = await Crate.findById(crateId);
        if (!crate) {
            return res.status(404).json({ success: false, message: "Crate not found" });
        }

        // Update the crate based on weight
        if (weight < 25) {
            crate.reinforcement = true;
            crate.weight = weight
            await crate.save();
            return res.status(200).json({ success: true, message: "Crate updated successfully" });
        } else if (weight < 100) {
            crate.status = 'active';
            crate.weight = weight
            await crate.save();
            return res.status(200).json({ success: true, message: "Crate updated successfully" });
        }

        // Save the updated crate

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

module.exports = router