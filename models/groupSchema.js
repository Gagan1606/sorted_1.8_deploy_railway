const mongoose = require('mongoose');
const groupSchema = new mongoose.Schema({
    groupName: String,
    userIds: [mongoose.Schema.Types.Mixed]
});
module.exports = mongoose.model("Group", groupSchema);