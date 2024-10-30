import mongoose, { Document, Schema, Model } from 'mongoose';
import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import csvParser from 'csv-parser';

import { HotelReservation } from './db/index';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const uri = process.env.URI || '';

app.use(express.json());
app.use(cors());

mongoose
    .connect(uri, { dbName: 'waterdip' })
    .then(() => {
        console.log('Connected to MongoDB');

        // Start the server only after connecting to MongoDB
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });

        // File reading and data insertion
        const csvFilePath = path.join(__dirname, 'hotel_bookings_1000.csv');
        const reservations: any[] = [];

        // Month mapping to convert string to number
        const monthMap: { [key: string]: number } = {
            January: 0,
            February: 1,
            March: 2,
            April: 3,
            May: 4,
            June: 5,
            July: 6,
            August: 7,
            September: 8,
            October: 9,
            November: 10,
            December: 11
        };

        fs.createReadStream(csvFilePath)
            .pipe(csvParser())
            .on('data', (row: any) => {
                // Convert the month name to a number
                const month = monthMap[row.arrival_date_month];

                // Create a formatted row for insertion
                const formattedRow = {
                    hotelName: row.hotel,
                    arrivalDate: new Date(
                        Number(row.arrival_date_year),
                        month,
                        Number(row.arrival_date_day_of_month)
                    ),
                    adults: Number(row.adults), 
                    country: row.country,
                    children: Number(row.children) || 0, 
                    babies: Number(row.babies) || 0 
                };

                reservations.push(formattedRow);
            })
            .on('end', () => {
                HotelReservation.insertMany(reservations)
                    .then(() => {
                        console.log('Data inserted successfully');
                    })
                    .catch((err) => {
                        console.error('Error inserting data:', err);
                    });
            })
            .on('error', (err: any) => {
                console.error('Error reading the file:', err);
            });
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB:', err);
    });

// API route for fetching data
app.post('/api/data', async (req: Request, res: Response) => {
    try {
        const data = await HotelReservation.find();
        res.json(data);
    } catch (err: any) {
        console.error('Error fetching data:', err);
        res.status(500).json({ message: err.message });
    }
});

export default app;
