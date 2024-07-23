const mongoose = require('mongoose');


const Schema = mongoose.Schema;

    const PostSchema = new Schema({
        title: {
        type: String,
        required: true
        },
        postedby: {
            type: String,
            required: true
            },
        body: {
            type: String,
            required: true
            },
            timePost: {
                type: Date,
                default: Date.now
                },
                upadtedAt: {
                    type: Date,
                    default: Date.now
                    },
    });

    module.exports = mongoose.model('Post', PostSchema);
