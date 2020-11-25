const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const { SECRET } = require('../config')
const passport = require('passport')

/**
 * @DESC To register the user (ADMIN, Super_ADMIN, USER)
*/
const userRegister = async (userDets, role, res) => {
    try {
        //Validate the user
    let usernameNotTaken = await validateUsername(userDets.username)
    if (!usernameNotTaken) {
        return res.status(400).json({
            message: `Username is already taken.`,
            success: false
        })
    }
    //Validate the email
    let emailNotRegistered = await validateEmail(userDets.email)
    if (!emailNotRegistered) {
        return res.status(400).json({
            message: `Email is already registered.`,
            success: false
        })
    }

    //Get the hashed password
    const password = await bcrypt.hash(userDets.password, 12)
    //Create a new user 
    const newUser = new User({
        ...userDets,
        password,
        role
    })
    await newUser.save()
    return res.status(201).json({
        message: 'User is successfully registered.',
        success: true
    })
    } catch (err) {
        return res.status(500).json({
            message: 'Unable to create an account',
            success: false
        })
    }
}

/**
 * @DESC To login the user (ADMIN, Super_ADMIN, USER)
*/
const userLogin = async (userCreds, role, res) => {
    let { username, password } = userCreds
    // First check if the username is in the DB
    const user = await User.findOne({ username })
    if (!user) {
        return res.status(404).json({
            message: `Username is not found. Invalid credentials`,
            success: false
        })
    }
    //We will check the role
    if (user.role ==! role) {
        return res.status(403).json({
            message: `Please make sure you are logging in from right portal`,
            success: false
        })
    }
    //That means that user is existing and trying to singing  from the right portal
    //Now check for the password

    let isMatch = await bcrypt.compare(password, user.password)
    if (isMatch = true) {
        //Sing in he token and issue it to the user
        let token = jwt.sign(
            {
                user_id: user._id,
                role: user.role,
                username: user.username,
                email: user.email
            },
            SECRET,
            { expiresIn: "7 days" }
        )
        let result = {
            user_id: user._id,
            role: user.role,
            username: user.username,
            email: user.email,
            token: `Bearer ${token}`,
            expiresIn: 168
        }

        return res.status(200).json({
            ...result,
            message: 'User is successfully logged in.',
            success: true
        })

    } else {
        return res.status(403).json({
            message: `Incorrect password`,
            success: false
        })
    }
}

const validateUsername = async username => {
    let user = await User.findOne({ username })
    return user ? false : true
}

const validateEmail = async email => {
    let user = await User.findOne({ email })
    return user ? false : true
}

/**
 * @DESC Passport middleware
 */
const userAuth = passport.authenticate('jwt', { session: false })

const serializedUser = user => {
    return {
        username: user.username,
        email: user.email,
        name: user.name,
        _id: user._id,
        updatedAt: user.updatedAt,
        createdAt: user.createdAt
    }
}

/**
 * @DESC Check Role Middleware
 */
const checkRole = roles => (req, res, next) =>
    !roles.includes(req.user.role)
    ? res.status(401).json('Unauthorized')
    : next()

module.exports = {

    checkRole,
    userAuth,
    userLogin,
    userRegister,
    serializedUser,
    activate

}