const mongoose = require('mongoose'),
    { Schema } = mongoose,
      shortid = require('shortid')

const ExerciseSchema = new Schema({
    description: {type: String, required: true},
    duration: {type: Number, required: true},
    date: Date
})

const UserSchema = new Schema({
    username: { type: String, required: true},
    shortid: { type: String, default: shortid.generate},
    exercises: {type: [ExerciseSchema], default: []}
})

const UserModel = mongoose.model('User', UserSchema)

module.exports = {
    createUser(username){
        let user = new UserModel({ username })
        return user.save()
    },
    addExercise: async (shortid, data) => {
        try {
            let user = await UserModel.findOne({shortid}),
                exercise = UserModel.exercises.create(data)
            if(!user) return {}
            user.exercises.push(exercise)
            user.markModified('exercises')
            return await user.save()
        } catch (error) {
            return { error }
        }
    }
}