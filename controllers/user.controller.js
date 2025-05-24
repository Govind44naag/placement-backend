import { User } from "../models/user.model.js"
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import cloudinary from "../utils/cloudinary.js";
import getDataUri from '../utils/datauri.js'
// Register a new user

export const register = async (req, res) => {
    try {
        const { fullName, email, phoneNumber, password, role } = req.body;
        if (!fullName || !email || !phoneNumber || !role) {
            return res.status(400).json({
                message: 'Something is missing',
                success: false,
            });
        }
        
        const file = req.file
        const fileUri = getDataUri(file)
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content)
        const existingUser = await User.findOne({ email });
     
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists with this email.",
                success: false,
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            fullName,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            profile: {
                profilePhoto: cloudResponse.secure_url,
            }
        });
       
        return res.status(200).json({
            message: 'Account created successfully',
            success: true,
        });

    } catch (e) {
       
        console.error(e);
        res.status(500).json({ message: 'Internal server error' });
        
    }
};

// Login user
export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({
                message: 'Something is missing',
                success: false,
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: 'Incorrect email or password.',
                success: false,
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(400).json({
                message: 'Incorrect email or password.',
                success: false,
            });
        }

        // Check if role matches
        if (role !== user.role) {
            return res.status(400).json({
                message: "Account doesn't exist with the current role.",
                success: false,
            });
        }

        const tokenData = {
            userId: user._id
        };

        const token = jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '1d' });

        const userData = {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        };

        return res.status(200)
            .cookie('token', token, { maxAge:  24*60*60*1000, httpOnly: true, sameSite: 'strict' })
            .json({
                message: `Welcome back ${user.fullName}`,
                success: true,
                user: userData
            });

    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Logout user
export const logout = async (req, res) => {
    try {
        return res.status(200)
            .cookie('token', '', { maxAge: 0 })
            .json({
                message: 'Logged out successfully',
                success: true,
            });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update user profile
export const updateProfile = async (req, res) => {
    try {
        const { fullName, email, phoneNumber, bio, skills } = req.body;
        //for cloudinary    
        const file = req.file
        const fileUri = getDataUri(file)
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content);


        // Ensure `skills` is defined before calling split
        let skillsArray = skills ? skills.split(',') : [];
        const userId = req.id; // from middleware authentication
        let user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({
                message: "User not found.",
                success: false,
            });
        }

        // Update fields only if they are provided
        if (fullName) user.fullName = fullName;
        if (email) user.email = email;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (bio) user.profile.bio = bio;
        if (skills) user.profile.skills = skillsArray;

        // Resume logic will be added here later...
        if (cloudResponse) {
            user.profile.resume = cloudResponse.secure_url//save the cloudinary url
            user.profile.resumeOriginalName = file.originalname//save this original file name


        }
        await user.save();

        const updatedUserData = {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        };

        return res.status(200).json({
            message: 'Profile updated successfully!',
            user: updatedUserData,
            success: true,
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Internal server error' });
    }
};
