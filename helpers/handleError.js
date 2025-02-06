module.exports = hanleError = async (ctx, error) => {
  console.log(error);
  if (ctx) {
    await ctx.reply("An error occured. Please try again later.");
  }
};
