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
    const { battalionName } = req.body;
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
        const newBattalion = new Batallion({ name: battalionName, admin: user._id });
        await newBattalion.save();

        // Push the battalion ID into the battalions array of the user
        user.batallions.push(newBattalion._id);

        // Save the updated user document
        await user.save();

        res.status(200).json({ success: true, message: 'Battalion added successfully', user });
    } catch (error) {
        console.error('Error adding battalion:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Api to add new crate and assign it to a battalion
router.put('/add-crate/:batallionId' , authMiddleware ,async(req,res)=>{
    const {type , name, weight} = req.body
    const batallionId = req.params.batallionId
    const {_id} = req.user;
    try {
        const batallion = await Batallion.findById(batallionId)
        if(!batallion) {
            return res.status(400).json({success: false, message: "failed to find the batallion"})
        }
        const newCrate = new Crate({name: name,access: _id ,type: type , weight: weight , battalion: batallion.id })
        await newCrate.save();
        const user = await User.findById(_id);
        user.crates.push(newCrate._id)
       
        batallion.crate.push(newCrate._id);
        return res.status(200).json({success: true, message: "Crate Added"})
        
    } catch (error) {
        return res.status(500).send("Internal Server Error")
        
    }
})

// Api to get the data 
router.get('/get-data',authMiddleware , async(req,res)=>{
    return res.status(200).json({success: success , user: req.user})
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
module.exports = router