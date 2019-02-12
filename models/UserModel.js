const mongoose = require('mongoose'),
    { Schema } = mongoose,
      shortid = require('shortid')

const ExerciseSchema = new Schema({
    description: {type: String, required: true},
    duration: {type: Number, required: true},
    date: {type: Date, default: Date.now}
})

const UserSchema = new Schema({
    username: { type: String, required: true},
    shortid: { type: String, default: shortid.generate},
    exercises: {type: [ExerciseSchema], default: []}
})

module.exports = {
    
}
