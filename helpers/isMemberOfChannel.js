module.exports = isMemberOfChannel = async (bot, channelId, chatId)=> {
    try {
      const member = await bot.telegram.getChatMember(channelId, chatId);
      return { success: true, result: member.status !== 'left' };
    } catch (error) {
      console.log("Error checking channel membership\n", error);
      return { success: false, result: false };
    }
  }