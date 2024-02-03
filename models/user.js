const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  country: {
    type: String,
    required: true,
  },
  service: {
    type: String,
    required: true,
    enum:['store','freelancer','website']
  },
  password: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  f_name: {
    type: String,
    required: true,
  },
  m_name: {
    type: String,
    default: ""
  },
  l_name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    default: ""
  },
  link: {
    type: String,
    default: ""
  },
  pic1: {
    type: String,
    default: ""
  },
  pic2: {
    type: String,
    default: ""
  },
  contact: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zip:{
    type:String,
    min:4,
    max:10,
  },
  icon:{
    type:String,
    default: ""
  },
  refcount: {
    type: Number,
    default: 0,
  },
  refid: {
    type: String,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model("Nupium user", userSchema)