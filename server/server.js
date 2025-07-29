import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connect } from 'mongoose';
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express'
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js"


const app = express();
const PORT = 3000;

await connectDB()

// Middleware
app.use(express.json());
app.use(cors());
app.use(clerkMiddleware())


//API Routes
app.get('/', (req, res) => res.send('Welcome to the SeatVerse API!'));
app.use('/api/inngest', serve({ client: inngest, functions }))

app.listen(PORT, () => console.log(`Server is listening on http://localhost:${PORT}`));

