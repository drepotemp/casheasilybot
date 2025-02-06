const handleError = require("./handleError");

module.exports = isMemberOfGroup = async (bot, groupId, chatId) => {
  try {
    const member = await bot.telegram.getChatMember(groupId, chatId);
    return { success: true, result: member.status !== "left" };
  } catch (error) {
    console.log("Error checking group membership\n", error);
    return { success: false, result: false };
  }
};
