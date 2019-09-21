const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        required: true
    },
    emailId: {
        type: String,
        required: true
    },
    mobno: {
        type: Number,
        required: true
    },
    role: {
        type: String, //ADMIN, SUPERVISOR
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('user', userSchema);