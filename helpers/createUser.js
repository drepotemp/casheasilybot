const User = require("../models/userModel");

module.exports = createUser = async (ctx) => {
  const { first_name, last_name, username, id } = ctx.from;
  let referralLink = `https://t.me/omegaadbot?start=Bot${id}`;
  const newUser = new User({
    firstname: first_name,
    lastname: last_name,
    username,
    referralLink,
    chatId: id,
  });

  await newUser.save();
};
