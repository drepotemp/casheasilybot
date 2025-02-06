const { Schema, model } = require("mongoose");

const taskSchema = new Schema({
  tiktok: {
    messageId: Number,
    chatId: Number,
  },
  whatsapp: {
    messageId: Number,
    chatId: Number,
  },
  telegram: {
    messageId: Number,
    chatId: Number,
  },
  other: {
    messageId: Number,
    chatId: Number,
  },
});

const Task = model("Task", taskSchema)
module.exports = Task