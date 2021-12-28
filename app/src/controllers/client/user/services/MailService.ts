import nodemailer from 'nodemailer'
import jwt from 'jsonwebtoken'
import { MailServiceInterface } from '@client/user/UserController'
import config from '@config'

const MailService: MailServiceInterface = {
  async sendSignUpEmail(email: string) {
    const token = jwt.sign({ email },
      config.JWT_TOKEN_SECRET,
      {
        expiresIn: '12h',
      })

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
      to: email,
      subject: 'elo',
      html: `<h1>Life sucks, dont let your hair suck too.</h1> 
      <br>
      <img src="https://i.pinimg.com/originals/70/9d/7c/709d7c19cb96088d1a59393b134d7a78.gif">
      <br>
      <p>Click on the following link to activate your account</p>
      <a href = "${process.env.CLIENT_URL}?tkn=${(token)}" > Your Validation </a>
      `,
    }
    transporter.sendMail(info, (err, data) => {
      console.error(err)
      // todo what to do with the error
    })
  },
}

export default MailService
