const User = require("../models/userModel");
const alreadyReferred = require("./alreadyReferred");
const createUser = require("./createUser");
const handleError = require("./handleError");
const replyFirstTimer = require("./replyFirstTimer");

module.exports = handleReferral = async (ctx, bot) => {
  try {
    const chatId = ctx.from.id;
    const { first_name, last_name, username } = ctx.from;

    // Check if user already has an account
    const userExists = await User.findOne({ chatId });
    if (userExists) {
      return await ctx.reply("You already have an account.");
    }

    let inviteId = ctx.payload;
    inviteId = parseInt(inviteId.split("t")[1]);

    //If user clicked a forged link
    if (isNaN(inviteId)) {
      return await ctx.reply("Sorry that link is invalid.");
    }

    //Find the invite link owner
    const referrer = await User.findOne({ chatId: inviteId });
    if (!referrer) {
      return await ctx.reply(
        "Sorry that link is invalid. Please check and try again."
      );
    }

    //If user clicked their own link
    if (inviteId === chatId) {
      return await ctx.reply("⚠️You cannot refer yourself.");
    }

    // Check if user has already been referred
    const alreadyReferredCheck = await alreadyReferred(chatId);

    //If an error prevented checking
    if (alreadyReferredCheck.error) {
      return await ctx.reply("An error occured. Please try again.");
    }

    //If they've already been referred by someone
    if (alreadyReferredCheck.result) {
      return await ctx.reply("You already have an account.");
    }

    //Create their account
    await createUser(ctx);

    const newReferral = {
      firstname: first_name,
      lastname: last_name,
      username,
      chatId
    };

    //Add this to referrer records
    referrer.referrals.push(newReferral);
    await referrer.save();

    let referrerMessage = ``;
    username
      ? (referrerMessage += `🔋 *You Got a New* [Referral](t.me/${username})`)
      : `🔋 *You Got a New Referral*`;
    if (username) {
      referrerMessage += ` [@${username}](t.me/${username})`;
    }
    if (first_name || last_name) {
      let name = first_name + " " + last_name;
      referrerMessage += `\n\n${name}`;
    }

    referrerMessage += `\n\n💡 _Reward is Earned Only If Referral Joins Our Group And Channel`;
    await bot.telegram.sendMessage(referrer.chatId, referrerMessage, {
      parse_mode: "Markdown",
      disable_web_page_preview: true,
    });
    await replyFirstTimer(ctx)
  } catch (error) {
    console.log(error);
    handleError(error, ctx);
  }
};
