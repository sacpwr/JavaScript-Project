const mongoose = require('mongoose');
let Category = require('../models/category');

const produtSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        required: true
    },
    mrp: {
        type: Number,
        required: true
    },
    categoryIds: {
        type: [],
        required: false
    }
});

module.exports = mongoose.model('product', produtSchema);