const { Router } = require('express');
const router = require('express').Router()

//Bring in the User Registration function
const {
    userRegister,
    userLogin,
    userAuth,
    serializedUser,
    checkRole
} = require('../utils/Auth')


//User Registration Route
router.post('/register-user', async(req, res) => {
    await userRegister(req.body, 'user', res)
})
//Admin Registration Route
router.post('/register-admin', async(req, res) => {
    await userRegister(req.body, 'admin', res)
})
//Super Admin Registration Route
router.post('/register-super-admin', async(req, res) => {
    await userRegister(req.body, 'superadmin', res)
})


//User Login Route
router.post('/login-user', async(req, res) => {
    await userLogin(req.body, 'user', res)
})
//Admin Login Route
router.post('/login-admin', async(req, res) => {
    await userLogin(req.body, 'admin', res)
})
//Super Admin Login Route
router.post('/login-super-admin', async(req, res) => {
    await userLogin(req.body, 'superadmin ', res)
})


//Profile Route
router.get('/profile',userAuth, async(req, res) => {
    return res.json(serializedUser(req.user))
})

//User Protected Route
router.get('/user-protected', userAuth, checkRole(['user']), async(req, res) => {
    return res.json('Hello User')
})
//Admin Protected Route
router.post('/admin-protected', userAuth, checkRole(['admin']), async(req, res) => {
    return res.json('Hello Admin')
})
//Super Admin Protected Route
router.get('/super-admin-protected', userAuth, checkRole(['superadmin']), async(req, res) => {
    return res.json('Hello SuperAdmin')
})

router.get('/super-admin-and-admin-protected', userAuth, checkRole(['superadmin', 'admin']), async(req, res) => {
    return res.json('Hello Super')
})


module.exports = router