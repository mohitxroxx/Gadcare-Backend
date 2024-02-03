const dotenv = require('dotenv')
const jwt = require("jsonwebtoken")
const auth = require("../middleware/auth")
const express = require("express")
const cookieParser = require('cookie-parser')
const user = require('../models/user')


const app = express()

app.use(express.json())
app.use(cookieParser())
dotenv.config()



const { Admin_User, Admin_Pass, TOKEN_KEY } = process.env

const users = [
    { id: 1, username: Admin_User, password: Admin_Pass },
]


app.post("/login",async (req, res) => {
    try {
        const { username, password ,rememberMe} = req.body;

        if (!username || !password||!rememberMe) {
            return res.json({ msg: 'Please fill the login details completely', status: false })
        }

        const user = users.find(u => u.username === username && u.password === password)

        if (!user) {
            return res.json({ msg: 'Invalid credentials', status: false })
        }
        const expiresIn = rememberMe ? '7d' : '2h';         
            const token = jwt.sign({ id: user.id, username: user.username }, TOKEN_KEY,{expiresIn})
        res.cookie('jwt', token, {
            secure: true,
            maxAge: expiresIn === '7d' ? 7 * 24 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000,
            httpOnly: true
        })
        return res.json({ 
            msg: 'Login successful',
            status: true
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ msg: 'Server error', status: false })
    }
});

app.get("/all", auth, async(req,res) => {
    try {
        const users=await user.find({})
        return res.status(200).json(users)
    } catch (error) {
        return res.status(400).json("cant fetch data from database")
    }
})
app.post("/all", auth, async(req,res) => {
    try {
        const{country}=req.body
        const users=await user.find({country:country})
        if(users.length==0)
        res.status(200).json('No data found for this country')
        return res.status(200).json(users)
    } catch (error) {
        return res.status(400).json("cant fetch data from database")
    }
})

app.get("/home", auth, (req,res) => {
    res.status(200).send("User Logged in and Session is Active")
})

app.get("/logout", async (req, res) => {
    try {
      res.clearCookie('jwt')
      res.status(200).send("User Logged out and session ended")
    } catch (ex) {
      next(ex)
    }
  })

module.exports = app;

