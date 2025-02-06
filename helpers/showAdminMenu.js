module.exports = showAdminMenu = async (ctx) => {
  await ctx.reply("🏡 *Admin Menu*", {
    parse_mode: "Markdown",
    reply_markup: {
      keyboard: [
        [
          {
            text: "🔊 Announcement",
          },
        ],

        [{ text: "📝 Tiktok task" }, { text: "📝 Whatsapp task" }],
        [{ text: "📝 Telegram task" }, { text: "📝 Other task" }],
      ],
      resize_keyboard: true,
    },
  });
};
