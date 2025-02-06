const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    balance: {
      type: Number,
      default: 0,
    },
    chatId: {
      type: Number,
      required: true,
    },
    username: String,
    firstname: String,
    lastname: String,
    referrals: {
      type: [
        {
          firstname: String,
          lastname: String,
          username: String,
          chatId: Number,
          referrerCredited: { type: Boolean, default: false },
        },
      ],
      default: [],
    },
    referralLink: {
      type: String,
      required: true,
    },
    lastBonusDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User = model("User", userSchema);
module.exports = User;
