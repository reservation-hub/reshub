const express = require("express")
const router = express.Router()
const mail = require("../../lib/mail")

//mailer routes
router.get("/",mail.mail.welcome)
router.get("/confirm",mail.mail.confirm)

module.exports = router