module.exports = showMenu = async (ctx) => {
  await ctx.reply("🏡 *Welcome To The Main Menu*", {
    parse_mode:"Markdown",
    reply_markup: {
     keyboard: [
        [
          {
            text: "💰 Balance",
            callback_data: "balance",
          },
          {
            text: "👩‍❤️‍👩 Invite",
            callback_data: "invite",
          },
        ],
        [
          {
            text: "🎁 Daily Bonus",
            callback_data: "bonus",
          },
          {
            text: "📁 Task",
            callback_data: "task",
          },
        ],
        [
          {
            text: "🏧 Withdraw",
            callback_data: "withdraw",
          },
          {
            text: "🖨️ Withdrawal Record",
            callback_data: "record",
          },
        ],
        [
          {
            text: "✍️ About CASH EASILY",
            callback_data: "about",
          },
          {
            text: "📊 Statistics",
            callback_data: "stats",
          },
        ],
      ],
      resize_keyboard: true,
    },
  });
};
