const mongoose = require('mongoose');

const schema = new mongoose.Schema({ 
    name: String,
    status: String,
    ordering: Number,
    content: String,
    thumb: String,
    category: {
        id: String,
        name: String,
    },
    created: {
        user_id: Number, 
        user_name: String,
        time: Date,
    },
    modified: {
        user_id: Number, 
        user_name: String,
        time: Date,
    }
});
module.exports = mongoose.model('article', schema);