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

app.get('/api/exercise/log', async (req, res) => {
  let { userId, from, to, limit } = req.query,
    notFound = {message: 'Not Found.'},
    d = null
  try {
    if(!/^[\w_.-]{5,15}$/.test(userId))
      return res.json(404, notFound)
    
    from = (d = new Date(from)) * 1? d: null
    to = (d = new Date(to)) * 1? d: null
    limit = (d = parseInt(limit))? d: null

    let user = await UserFunc.getUser(userId, limit, from, to)
    if(!user)
      return res.json(404, notFound)
    res.json(UserFunc.transform(user))
  } catch (error) {
    res.json(500, {error: error})
  }
})

app.post('/api/exercise/new-user', async (req, res) => {
  let { username } = req.body
  try {

    username = (username || '').trim()
    if(!/^.{3,25}$/.test(username))
      return res.json(400, {message: 'please fill all fields with the required format.'})

    let user = await UserFunc.createUser(username)
    res.json(UserFunc.transform(user))
  } catch(ex) {
    res.json(500, {error: ex})
  }
})

app.post('/api/exercise/add', async (req, res) => {
  let { userId, description, duration, date } = req.body, d = new Date(date)
  try {
    if(!/^[\w_.-]{5,15}$/.test(userId) || !/^.{1,250}$/.test(description) || !/^\d+$/.test(duration))
      return res.json(400, {message: 'please fill all fields with the required format.'})
    
	  date = !!(d * 1)? d: undefined
    let user = await UserFunc.addExercise(userId, { description, duration: Number(duration), date})
    res.json(UserFunc.transform(user))
  } catch(ex) {
    res.json(500, {error: ex})
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
