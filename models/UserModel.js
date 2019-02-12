const mongoose = require('mongoose'),
    { Schema } = mongoose,
      shortid = require('shortid')

const ExerciseSchema = new Schema({
    description: {type: String, required: true},
    duration: {type: Number, required: true},
    date: { type: Date, default: Date.now}
})

const UserSchema = new Schema({
    username: { type: String, required: true},
    sid: { type: String, default: shortid.generate},
    exercises: {type: [ExerciseSchema], default: []}
}, {
    usePushEach: true
})

const UserModel = mongoose.model('User', UserSchema)

module.exports = {
    createUser(username){
        let user = new UserModel({ username })
        return user.save()
    },
    addExercise: async (sid, data) => {
        try {
            let user = await UserModel.findOne({sid})
            if(!user) return {message: 'Not Found.'}
            user.exercises.push(data)
            user.markModified('exercises')
            return await user.save()
        } catch (error) {
            return { error }
        }
    },
    getUser: async (sid, limit, from, to) => {
        try {
            let user = await UserModel.findOne({ sid }).exec(), arr = []

            if(!user) return null
            user = user.toObject()
            arr = user.exercises.filter(v => (from? v.date >= from: true) && (to? v.date <= to: true))

            if(limit && limit > 0) arr = arr.slice(0, limit)
            user.exercises = arr
            return user
        } catch (error) {
            return { error }
        }
    },
    transform(user) {
        if(!user) return null
    
        let {username, sid: _id, exercises } = user
        return {
            username,
            _id,
            exercises: exercises.map(({ description, duration, date }) => ({ description, duration, date }))
        }
    }
}