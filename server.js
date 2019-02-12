const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const UserFunc = require('./models/UserModel')

const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track' )

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/exercise/new-user', async (req, res) => {
  let { username } = req.body
  try {
    if(!/^\w{3,25}$/.test(username))
      return res.status(400).json({message: 'please fill all fields with the required format.'})

    let user = await UserFunc.createUser(username)
    res.json(user)
  } catch(ex) {
    res.status(400).json({error: ex})
  }
})

app.post('/api/exercise/add', async (req, res) => {
  let { userId, description, duration, date } = req.body, d = new Date(date)
  userId = (userId || '').trim()
  description = (description || '').trim()
  duration = (duration || '').trim()
  try {
    if(!/^\w{5,15}$/.test(userId) || !/^.{1,250}$/.test(description) || !/^\d+$/.test(duration))
      return res.status(400).json({message: 'please fill all fields with the required format.'})
    
	  date = !!(d * 1)? d: undefined
    let user = await UserFunc.addExercise(userId, { description, duration: Number(duration), date})
    res.json(user)
  } catch(ex) {
    res.status(500).json({error: ex})
  }
})

// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
