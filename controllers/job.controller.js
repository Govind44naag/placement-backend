import { Job } from '../models/job.model.js'
import mongoose from 'mongoose'

// For Admin: Posting a new job
export const postJob = async (req, res) => {
    try {
        const {
            title,
            description,
            requirements,
            salary,
            location,
            jobType,
            experience,
            position,
            companyId
        } = req.body;

        const userId = req.id;
        if(salary <0 || experience<0 || position <1){
            return res.status(400).json({
                message:"Can't Post Job",
                success:false,
            })
        }

        // Validate required fields
        if (!title || !description || !requirements || !salary || !location ||
            !jobType || experience===undefined  || !position || !companyId) {
               
            return res.status(400).json({
                message: 'Missing required fields!',
                success: false,
            });
        }

        // Validate salary
        if (isNaN(Number(salary))) {
            return res.status(400).json({
                message: 'Salary must be a valid number!',
                success: false,
            });
        }

        // // Validate ObjectIds for company and user
        // if (!mongoose.Types.ObjectId.isValid(companyId) || !mongoose.Types.ObjectId.isValid(userId)) {
        //     return res.status(400).json({
        //         message: 'Invalid ObjectId for company or user!',
        //         success: false,
        //     });
        // }

        // Create job
        const job = await Job.create({
            title,
            description,
            requirements: requirements.split(","), // trim requirements
            salary: Number(salary),
            location,
            jobType,
            experienceLevel: experience,
            position,
            company: companyId,
            created_by: userId
        });

        return res.status(201).json({
            message: 'New job created successfully!',
            job,
            success: true,
        });
    }
    catch (e) {
        console.error('Error creating job:', e);
        return res.status(500).json({
            message: 'Internal Server Error',
            error: e.message,
            success: false,
        });
    }
};

//will be use full for student  
export const getAllJobs = async (req, res) => {
    try {
        const keyword = req.query.keyword || '';
        const query = {
            $or: [
                { title: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } },
            ]
        }
        const jobs = await Job.find(query)
        if (!jobs) {
            return res.status(404).json({
                message: 'Job not found.',
                success: false,
            })
        }
        return res.status(200).json({
            jobs,
            success: true,
        })
    }
    catch (e) {
        console.error(e)
    }
}


      

export const getJobById = async (req, res) => {
    try {
        const jobId = req.params.jobId;
            
        // Validate Job ID before querying
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({
                message: "Invalid job ID!",
                success: false,
            });
        }

        const job = await Job.findById(jobId).populate("application");

        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false,
            });
        }

        return res.status(200).json({ job, success: true });

    } catch (e) {
        console.error("Error fetching job:", e);
        return res.status(500).json({
            message: "Server error.",
            success: false,
        });
    }
};

//how many job has created by admin
export const getAdminJobs = async (req, res) => {
    try {
        const adminId = req.id
        const jobs = await Job.find({ created_by: adminId }).populate({
            path:'company',
            createdAt:-1,
        })
        if (!jobs) {
            return res.status(404).json({
                message: 'Jobs not found',
                success: false,
            })
        }
        return res.status(200).json({
            message: "successfully get admin jobs",
            jobs,
            success: true,
        })
    } catch (e) {
        console.error(e)
    }
}