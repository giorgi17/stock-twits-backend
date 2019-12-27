const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create Schema
const UserSchema = new Schema({
  user_id: {
    type: Number,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  access_token: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  symbols: {
    type: Array,
    default: []
  },
});

module.exports = StocktwitsUser = mongoose.model("stocktwitsUsers", UserSchema);