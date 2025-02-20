module.exports = showMenu = async (ctx) => {
  await ctx.reply("🏡 *Welcome To The Main Menu*", {
    parse_mode: "Markdown",
    reply_markup: {
      keyboard: [
        [
          {
            text: "💰 Balance",
          },
          {
            text: "👩‍❤️‍👩 Invite",
          },
        ],
        [
          {
            text: "🎁 Daily Bonus",
          },
          {
            text: "📁 Task",
          },
        ],
        [
          {
            text: "🏧 Withdraw",
          },
          {
            text: "🖨️ Withdrawal Record",
          },
        ],
        [
          {
            text: "✍️ About DEXHALE ADS",
          },
          {
            text: "📊 Statistics",
          },
        ],
      ],
      resize_keyboard: true,
    },
  });
};
