const handleError = require("./handleError");

module.exports = replyFirstTimer = async (ctx) => {
  try {
    const message = `⛔ *Must Join All Our Channels And Groups*

➡️ https://chat.whatsapp.com/FYdEyV9vWOs6l0QWc7IMcM

➡️ @etheriumofficialemail

➡️ https://whatsapp.com/channel/0029Vb4OqKM96H4Njlt9Tz3G

➡️ https://t.me/+OUemRtuIJQw3MTA0

*Make sure to join all groups for easy access to your dashboard*

*After Joining, Click on ✅Joined*
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
