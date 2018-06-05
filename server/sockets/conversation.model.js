const mongoose = require('mongoose')

let conversationSchema = new mongoose.Schema({
    userone: {type : mongoose.Schema.Types.ObjectId, ref : 'User'},
    usertwo: {type : mongoose.Schema.Types.ObjectId, ref:'User'},
    messages: [{
            from: String,
            to: String,
            text: String,
            createdAt: { type: Date }
        }]
})

module.exports = mongoose.model('Conversation', conversationSchema)
