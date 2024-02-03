const express=require('express')
const router=express.Router()
const login=require('../controller/admin')
const auth=require('../middleware/auth')
const home=require('../controller/admin')
const all=require('../controller/admin')
const logout=require('../controller/admin')

router.post('/login',login)
router.get('/home',auth,home)
router.get('/all',auth,all)
router.post('/all',auth,all)
router.get('/logout',auth,logout)

module.exports=router