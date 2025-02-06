const User = require("../models/userModel");

module.exports = alreadyReferred = async (chatId) => {
  try {
    const user = await User.findOne({
      referrals: { $elemMatch: { chatId: chatId } },
    });
    // Returns true if user has been referred by anyone, false otherwise
    return { error: false, result: !!user };
  } catch (error) {
    console.log("Error checking if user has been referred:", error);
    return { error: true };
  }
};