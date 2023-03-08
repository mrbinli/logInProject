const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
    minLength: 3,
    maxLength: 255,
  },
  googleID: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  thumbnail: {
    type: String,
    default: "/default_profile_picture.png",
  },
  //local login
  email: {
    type: String,
  },
  password: {
    type: String,
    minLength: 8,
    maxLength: 1024,
  },
});
module.exports = mongoose.model("User", userSchema);
