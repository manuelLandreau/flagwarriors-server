import Mongoose from 'mongoose'

//mongoose User model
const User = new Mongoose.Schema(
  {
    email: {type: String}, // , match: /^[a-zA-Z0-9-_@.]+$/
    pseudo: {type: String}, // , match: /^[a-zA-Z0-9-_@.]+$/
    password: {type: String}, // , match: /^[a-zA-Z0-9-_@.]+$/
    victories: {type: Number},
    defeats: {type: Number},
    ratio: {type: Number}
  }
)

export default User