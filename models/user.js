const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
  username: String,
  name: String,
  adult: Boolean,
  passwordHash: String
})

userSchema.statics.format = function (user) {
  return {
    username: user.username,
    name: user.name,
    adult: user.adult,
    id: user._id
  }
}

const User = mongoose.model('user', userSchema)

module.exports = User