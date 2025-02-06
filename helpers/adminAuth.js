require("dotenv/config");
module.exports = adminAuth = (ctx) => {
  return ctx.from.id == process.env.ADMIN_CHAT_ID;
};
