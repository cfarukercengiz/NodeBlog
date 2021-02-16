const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    cmtName: { type: String, required: true },
    cmtEmail: { type: String, required: true },
    cmtContent: { type: String, required: true },
    cmtDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', CommentSchema);