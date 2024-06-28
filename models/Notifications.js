const mongoose = require('mongoose')

const notificationsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        required: false
    },
    tripNo: {
        type: String,
        required: false
    },
    customerId: {
        type: String,
        required: false
    },
    notificationTitle: {
        type: String,
        required: true
    },
    notificationMessage: {
        type: String,
        required: true
    },
    notificationStatus: {
        type: String,
        required: false
    },
    created_at: {
        type: Date,
        default: new Date(),
        required: true
    }
})

module.exports = mongoose.model('notifications', notificationsSchema)