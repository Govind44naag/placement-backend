// const express=require('express') old way write module in type for use express like import
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './utils/db.js'
import userRoute from './routes/user.route.js'
import companyRoute from './routes/company.route.js'
import jobRoute from './routes/job.route.js'
import applicationRoute from './routes/application.route.js'

dotenv.config({})
connectDB()

const app=express()


//middleware
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

const corsOptions = {
    origin: 'https://placementportal-rho.vercel.app',  
    credentials: true,
};

app.use(cors(corsOptions))

const Port=process.env.Port ||3000


//api's
app.use('/api/v1/user',userRoute)//user is okay
app.use('/api/v1/company',companyRoute)//company is okay
app.use('/api/v1/job',jobRoute)//job route is okay
app.use('/api/v1/application',applicationRoute)
//jj


app.listen(Port,()=>{
    console.log(`Server is Running on Port number ${Port}`)//``this sign  is called tample literal
})