const mongoose = require('mongoose')
const Schema = mongoose.Schema

const personSchema = new Schema({
  username: String,
  name: String,
  password: String,
  adult: Boolean
})

personSchema.statics.format = function (person) {
  return {
    username: person.username,
    name: person.name,
    adult: person.adult,
    id: person._id
  }
}

const Person = mongoose.model('person', personSchema)

module.exports = Person