const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const Auth = require('../middlewares/Auth')
const Trips = require('../models/Trips')
const Notifications = require('../models/Notifications')
const moment = require('moment/moment')

router.get("/get_admin_notifications", async (req, res) => {

    const query = {
        notificationStatus: "New"
    }
    try {
        await Notifications.find(query)
            .then(response => {
                return res.status(200).json({
                    data: response,
                    count: response.length
                })
            })
            .catch(err => {
                return res.status(500).json({
                    data: err
                })
            })
    } catch (error) {
        return res.status(500).json({
            data: error
        })
    }
})

module.exports = router