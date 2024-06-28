const mongoose = require('mongoose')

const vehicleSchema = new mongoose.Schema({
    vehicleName: {
        type: String,
        required: false
    },
    vehicleNo: {
        type: String,
        required: false
    },
    maxPersons: {
        type: String,
        required: false
    },
    maxBags: {
        type: String,
        required: false
    },
    feature: {
        type: String,
        required: false
    },
    basePrice: {
        type: String,
        required: false
    },
    baseDistance: {
        type: String,
        required: false
    },
    pricePerUnitDistance: {
        type: String,
        required: false
    },
    pricePerUnitHour: {
        type: String,
        required: false
    },
    images: {
        type: Array,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    status: {
        type: String,
        required: false
    },
})

module.exports = mongoose.model('vehicles', vehicleSchema)