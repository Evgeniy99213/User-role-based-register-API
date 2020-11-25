const cors = require('cors')
const express = require('express')
const bodyParser = require('body-parser')
const passport = require('passport')
const { success, error } = require('consola')
const { connect } = require('mongoose')



//Bring in the app constants
const { DB, PORT } = require('./config')

//Initialize  the app
const app = express()

//Middlewares 
app.use(cors())
app.use(bodyParser.json())
app.use(passport.initialize())

require('./middleware/passport')(passport)

//User Router middleware
app.use('/api/users', require('./routes /users'))

const startApp = async () => {
    try {
        //Connection with DB
        await connect(DB, {
            useFindAndModify: true,
            useUnifiedTopology: true,
            useNewUrlParser: true
        })

        success({
            message: `Successfully connected to the DataBase \n${DB}`,
            badge: true
        })

        //Start listening for the server
        app.listen(PORT, () =>
         success({ message: `Server has been started on the port ${PORT}`, badge: true })
        )
    } catch (err) {
        error({
            message: `Unable to connect with DataBase \n${err}`,
            badge: true
        })
        startApp()
    }

}

startApp()
