import User from "../models/User.js"
import Booking from "../models/Booking.js"
import Show from "../models/Show.js"
import { err } from "inngest/types"


//API to check if user is admin
export const isAdmin = async (req, res) => {
    res.json({success: true, isAdmin: true})
}

// API to get dashboard data
export const getDashboardData = async (req, res) => {
    try {
        const bookings = await Booking.find({isPaid: true});
        const activeShows = await Show.find({showDateTime: {$gte: new Date()}}).populate('movie');

        const totalUser = await User.countDocuments();

        const dashboardData = {
            totalBookings: bookings.length,
            totalRevenue: bookings.reduce((acc, booking) => acc + booking.amount, 0),
            activeShows,
            totalUser
        }

        res.json({success: true, dashboardData})

    } catch (error) {
        console.error(error);
        res.json({success: false, message: error.message})
    }
}

// API to get all shows
export const getAllShows = async (req, res) => {
    try {
        const shows = await Show.find({showDateTime: {$gte: new Date()}}).populate('movie').sort({showDataTime: 1})
        res.json({success: true, shows})
    } catch (error) {
        console.error(error);
        res.json({success: false, message: error.message})
    }
}

// API to get all bookings
export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({}).populate('user').populate({
            path: "show",
            populate: {path: "movie"}
        }).sort({ createdAt: -1 })
        res.json({success: true, bookings})
    } catch(error) {
        console.error(error);
        res.json({success: false, message: error.message})
    }
}

// API to delete unpaid bookings and release seats
export const deleteUnpaidBookings = async (req, res) => {
    try {
        // Find all unpaid bookings
        const unpaidBookings = await Booking.find({ isPaid: false });
        
        let releasedSeatsCount = 0;
        let deletedBookingsCount = 0;
        
        // For each unpaid booking, release the seats
        for (const booking of unpaidBookings) {
            const show = await Show.findById(booking.show);
            if (show) {
                // Release seats for this booking
                booking.bookedSeats.forEach((seat) => {
                    delete show.occupiedSeats[seat];
                    releasedSeatsCount++;
                });
                show.markModified('occupiedSeats');
                await show.save();
            }
            // Delete the booking
            await Booking.findByIdAndDelete(booking._id);
            deletedBookingsCount++;
        }
        
        res.json({ 
            success: true, 
            message: `Released ${releasedSeatsCount} seats and deleted ${deletedBookingsCount} unpaid bookings` 
        });
    } catch (error) {
        console.error(error);
        res.json({success: false, message: error.message});
    }
}
