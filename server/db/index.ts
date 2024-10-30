import mongoose, { Document, Schema, Model } from 'mongoose';

// Define an interface for the HotelReservation document
interface IHotelReservation extends Document {
    hotelName: string;
    arrivalDate: Date;
    adults: number;
    children?: number;
    babies?: number;
    country: string;
}


// Define the hotel reservation schema
const hotelReservationSchema: Schema = new mongoose.Schema({
    hotelName: {
        type: String,
        required: true
    },
    arrivalDate: {
        type: Date,
        required: true
    },
    adults: {
        type: Number,
        required: false,
        min: 0
    },
    children: {
        type: Number,
        default: 0,
        min: 0
    },
    babies: {
        type: Number,
        default: 0,
        min: 0
    },
    country: {
        type: String,
        required: true
    }
});


// Create models based on the schemas
const HotelReservation: Model<IHotelReservation> = mongoose.model<IHotelReservation>('HotelReservation', hotelReservationSchema);


// Export the models
export { HotelReservation };
