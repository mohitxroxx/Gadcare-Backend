const Saveuser = require('./user')
const ref = require('./ref')
const nodemailer = require('nodemailer')
const express = require("express")
const jwt = require("jsonwebtoken")
const auth = require("../middleware/auth")
const cookieParser = require('cookie-parser')
const dotenv = require('dotenv')
const bcrypt = require("bcrypt")
const user = require("../models/user")
const cloudinary = require("../config/cloudinary")
const upload = require("../middleware/multer")
dotenv.config()
const app = express()
app.use(cookieParser())



const { SMTP_EMAIL, SMTP_PASS, TOKEN_KEY } = process.env

let transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: SMTP_EMAIL,
    pass: SMTP_PASS,
  },
})


app.post("/register", async (req, res) => {
  try {
    const { country, service, password, email, f_name, m_name, l_name, category, name, pic1, pic2, link, contact, city, state, zip } = req.body
    if (!country || !service || !password || !email || !f_name || !l_name || !category || !contact || !city || !state || !zip)
      return res.status(400).json({ error: 'Enter all the mandatory fields correctly' })
    const emailCheck = await user.findOne({ email })
    if (emailCheck)
      return res.status(400).json({ error: 'Email already used' })
    const refcode = await ref.gencode()
    // console.log(refcode)
    const otpreq = { ...req, body: { email, refcode } }
    const hashedPassword = await bcrypt.hash(password, 10)
    let newUser = {
      country,service,password:hashedPassword,email,f_name,m_name,l_name,category,name,link,pic1,pic2,contact,city,state,zip, refcount: 0, refid: refcode
    }
    otp(otpreq, res)
      .then(() => {
        Saveuser.registerUser(newUser)
          .then(() => {
            res.status(200).json({ msg: 'Successfully registered check mail for further process', status:true})
          })
          .catch((error) => {
            console.error(error)
            res.status(400).json({ error: 'Error registering the user' })
          })
      })
      .catch((error) => {
        console.error(error)
        res.status(400).json({ error: 'Error sending the OTP' })
      })

  } catch (error) {
    console.error(error)
    return res.status(400).json({ error: 'Error registering the user' })
  }
})

async function otp(req, res) {
  const { email, refcode } = req.body;
  // const refcode = await ref.gencode()
  // console.log(email)
  // console.log(refcode)
  const mailOptions = {
    from: SMTP_EMAIL,
    to: email,
    subject: "Hello there",
    html: `<body>
              <body style="font-family: Arial, sans-serif margin: 0 padding: 0 background-color: #ffffb3">
                  <table role="presentation" cellspacing="0" cellpadding="0"  width="600"
                      style="margin: 0 auto background-color: #fff padding: 20px border-radius: 5px box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.3)">
                      <tr>
                          <td>
                              <h3 style="color: #0838bc font-size: 24px text-align: center margin-bottom: 10px">Welcome To XXXXXX</h3>
                              <hr style="border: 1px solid #ccc margin: 20px 0">
                              <h4 style="font-size: 20px color: #333">Your Partner ID has been activated now</h4>
                              <p style="font-size: 16px color: #333 margin: 20px 0">You're all set, now you can easily handle your Partner dashboard by 
                              just login with your account details as per below details
                              You can also download your channel partner agreement after login                     
                                </p>
                              <p style="font-size: 16px color: #333">Here is your Partner ID: ${refcode}</p>
                              <p style="font-size: 16px color: #333">User ID: ${email}</p>
                              <p style="font-size: 16px color: #333">Password:[Password used by you upon registration]</p>
                              <p style="font-size: 16px color: #333">Link to Login: www.zzzzz.com</p>
                              <div style="font-size: 16px color: #333 margin-top: 20px text-align: center">
                                  <h5 style="font-size: 18px">Best Regards</h5>
                                  <h5 style="font-size: 18px">XXXXXX</h5> 
                              </div>
                          </td>
                      </tr>
                  </table>
              </body>
          </body>`,
  }
  transporter
    .sendMail(mailOptions)
    .then(() => {
      console.log("Mail sent to the user")
    })
    .catch((err) => {
      console.log(err);
      return 0;
    })
}


app.post('/login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body
    //   console.log(req.body)
    if (!email || !password || !rememberMe)
      return res.status(400).send('Enter all the fields correctly')
    const chk = await user.findOne({ email })
    if (!chk)
      return res.status(404).send('User does not exists')
    const match = await bcrypt.compare(password, chk.password)
    if (!match)
      return res.status(400).send('Wrong credentials')
    const expiresIn = rememberMe ? '7d' : '2h';
    const token = jwt.sign({ id: chk.id, email: chk.email }, TOKEN_KEY, { expiresIn })
    res.cookie('jwt', token, {
      secure: true,
      maxAge: expiresIn === '7d' ? 7 * 24 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000,
      httpOnly: true
    })
    res.status(200).json({ msg: 'Login successful', status: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ msg: 'Failed to login an error occured', status: false })
  }
})

app.post("/icon",async(req,res)=>{
  try {
    const {email,img}=req.body;
    const info=await user.findOneAndUpdate({email:email},{icon:img},{new:true})
    // console.log(info)
    res.status(200).json({msg:'Icon updated'})
  } catch (error) {
    console.error(error)
    res.status(400).json({err:"failed to update the icon"})
  }
})

app.get("/logout", async (req, res) => {
  try {
    res.clearCookie('jwt')
    // res.clearCookie('refid')
    res.status(200).send("User Logged out and session ended")
  } catch (ex) {
    next(ex)
  }
})

app.post("/upload", async (req, res) =>
  upload.single('image')(req, res, function (err) {
    if (err) {
      console.log(err)
      return res.status(200).send("Error occured while uploading")
    }
    cloudinary.uploader.upload(req.file.path, function (err, result) {
      if (err) {
        console.log(err)
        return res.status(500).send("Error occured with cloudinary")
      }
      return res.status(200).json({ msg: "Uploaded successfully", imageUrl: result.url })
    })
  })
)

app.post('/home',async(req,res)=>{
  try {
    const {email}=req.body;
    const currentUser=await user.findOne({email:email})
    res.status(200).json(currentUser)
  } catch (error) {
    res.status(500).json("internal server error occured while fetching data")
  }
})
module.exports = app;