const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    userId: String,
    password: String,
    // faceId: String,
    faceEmbedding: String,
    groups: [mongoose.Schema.Types.Mixed]
});
module.exports = mongoose.model("User", userSchema);