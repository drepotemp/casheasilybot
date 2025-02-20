const handleError = require("./handleError");

module.exports = replyFirstTimer = async (ctx) => {
  try {
    const message = `⛔ *Join Our Channel And Group To Use The Bot🤖*

➡️ t.me/dexhaletechs

➡️ t.me/dexhale

*After Joining, Click on ✅Joined to continue.*
`;
    await ctx.reply(message, {
      parse_mode: "Markdown",
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "✅ Joined",
              callback_data: "verify_join",
            },
          ],
        ],
      },
    });
  } catch (error) {
    handleError(ctx, error);
  }
};
