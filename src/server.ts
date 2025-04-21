
import express, { Request, Response } from 'express'
import dotenv from 'dotenv'
import cookieParser from "cookie-parser"
import cors from "cors"
import { Pool } from 'pg' // Import Pool from pg
import userRoutes from './routes/userRoutes'
import jobseekerProfileRoutes from './routes/jobseekerProfileRoutes'
import employerProfileRoutes from './routes/employerProfileRoutes'
import skillsRoutes from './routes/skillsRoutes'
import userSkillsRoutes from './routes/userSkillsRoutes'
import jobRoutes from './routes/jobRoutes'
import jobskillsRoutes from './routes/jobskillsRoutes'
import applicationsRoutes from './routes/applicationsRoutes'
import interviewsRoutes from './routes/interviewsRoutes'
import authRoutes from './routes/authRoutes'






// 1:dotenv
dotenv.config()

// Initialize the database connection pool
export const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
});
dotenv.config()

//2:instance of express  
const app = express()

//3:NEVER IN YOUR LIFE FORGET THIS 
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) 
//Cookie parser middleware
app.use(cookieParser())
//eneable CORS for all origins  
// app.use(cors())


const allowedOrigins = [
    'http://localhost:4200',
    'https://skillsmatchai.vercel.app',
  ];
  
  app.use(cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true 
  }));
  

  app.options('*', cors());
  

//4. routes 
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/users", userRoutes)
app.use("/api/v1/applications", applicationsRoutes)
app.use("/api/v1/user_skills", userSkillsRoutes)
app.use("/api/v1/skills",skillsRoutes)
app.use("/api/v1/jobskills",jobskillsRoutes)
app.use("/api/v1/jobs",jobRoutes)
app.use("/api/v1/interviews",interviewsRoutes)
app.use("/api/v1/jobseekerProfile", jobseekerProfileRoutes)
app.use("/api/v1/employerProfile", employerProfileRoutes)


const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`🚀🚀 server is running on port - ${PORT}`)
})
