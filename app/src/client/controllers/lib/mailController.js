const nodemailer = require('nodemailer')
const jwtTokenCreator = require('./jwtTokenCreator')

exports.mailController = {
  mailSender(addr) {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // use SSL
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    })
    const info = {
      from: process.env.MAIL_ADDRESS,
      to: addr,
      subject: 'elo',
      html: `<h1>Life sucks, dont let your hair suck too.</h1> 
      <br>
      <img src="https://i.pinimg.com/originals/70/9d/7c/709d7c19cb96088d1a59393b134d7a78.gif">
      <br>
      <p>Click on the following link to activate your account</p>
      <a href = " http://localhost:8080/?tkn=${jwtTokenCreator.create(addr)}" > Your Validation </a>
      `,
    }
    transporter.sendMail(info, (err, data) => {
      // eslint-disable-next-line no-console
      console.log(data, err)
    })
  },
}
