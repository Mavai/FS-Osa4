const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
  username: String,
  name: String,
  adult: Boolean,
  passwordHash: String,
  blogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }]
})

userSchema.statics.format = function (user) {
  return {
    username: user.username,
    name: user.name,
    adult: user.adult,
    blogs: user.blogs,
    id: user._id
  }
}

const User = mongoose.model('User', userSchema)

module.exports = User