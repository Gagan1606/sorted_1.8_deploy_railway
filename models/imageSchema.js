const mongoose = require('mongoose');
const imageSchema = new mongoose.Schema({
    photoName: String,
    photoData: Buffer,
    photoType: String,
    userId: String,
    uploadedAt: Date,
    grpId:String,
    usersPresent:[String]
});
module.exports = mongoose.model('Image', imageSchema);
