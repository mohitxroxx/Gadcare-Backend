const express=require('express')
const router=express.Router()

const auth=require('../middleware/auth')
const register=require('../controller/partner')
const login=require('../controller/partner')
const logout=require('../controller/partner')
const upload=require('../controller/partner')
const home=require('../controller/partner')
const icon=require('../controller/partner')


router.post('/register',register)
router.post('/login',login)
router.get('/logout',auth,logout)
router.post('/upload',auth,upload)
router.post('/home',auth,home)
router.post('/icon',auth,icon)


module.exports=router 