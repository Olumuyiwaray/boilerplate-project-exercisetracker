const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const exerciseSchema = new Schema({
    userId: { type: String, required: true},
    username: String,
    description: { type: String, required: true},
    duration: { type: Number, required: true},
    date: Date
});


const Exercise = mongoose.model('Exercise', exerciseSchema);

module.exports = Exercise;
