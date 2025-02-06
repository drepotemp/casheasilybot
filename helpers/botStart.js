const User = require("../models/userModel");
const createUser = require("./createUser");
const handleError = require("./handleError");
const handleReferral = require("./handleReferral");
const isMemberOfChannel = require("./isMemberOfChannel");
const isMemberOfGroup = require("./isMemberOfGroup");
const replyFirstTimer = require("./replyFirstTimer");
const showMenu = require("./showMenu")
require("dotenv/config");
const groupId = process.env.GROUP_ID;
const channelId = process.env.CHANNEL_ID;

module.exports = botStart = async (ctx, bot) => {
  global.queue.enqueue(async () => {
    const chatId = ctx.from.id;
    let alreadyCheckedExistence = false;

    try {
      //check if user clicked a link
      if (ctx.payload) {
        alreadyCheckedExistence = true;
        return await handleReferral(ctx, bot);
      }

      if (!alreadyCheckedExistence) {
        //check if user exists
        const userExists = await User.findOne({ chatId });

        //If no, create an account for them
        if (!userExists) {
          await createUser(ctx);
        }
      }

      //Check group membership
      const isGroupMember = await isMemberOfGroup(bot, groupId, chatId);
      if (!isGroupMember.success) {
        return await ctx.reply("An error occured. Please try again later.");
      }

      if (isGroupMember.success) {
        if (!isGroupMember.result) {
          return await replyFirstTimer(ctx);
        }
      }

      //Check channel membership
      const isChannelMember = await isMemberOfChannel(bot, channelId, chatId);
      if (!isChannelMember.success) {
        return await ctx.reply("An error occured. Please try again later.");
      }

      if (isChannelMember.success) {
        if (!isChannelMember.result) {
          return await replyFirstTimer(ctx);
        }
      }

      await showMenu(ctx);
    } catch (error) {
      handleError(ctx, error);
    }
  });
};
