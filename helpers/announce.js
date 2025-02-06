const showAdminMenu = require("./showAdminMenu");

module.exports = announce = async (
  bot,
  chatId,
  message,
  adminCtx,
  adminState
) => {
  if (!message || !chatId) {
    console.error("Invalid message or chat ID");
    return;
  }

  const options = {}; // Store optional parameters
  if (message.caption) options.caption = message.caption;
  if (message.parse_mode) options.parse_mode = message.parse_mode;
  if (message.reply_markup) options.reply_markup = message.reply_markup;

  const media = [];

  try {
    // Use file_id directly
    if (message.photo) {
      media.push({
        type: "photo",
        media: message.photo[message.photo.length - 1].file_id,
        caption: options.caption || "",
      });
    }

    if (message.video) {
      media.push({
        type: "video",
        media: message.video.file_id,
        caption: options.caption || "",
      });
    }

    if (message.audio) {
      media.push({
        type: "audio",
        media: message.audio.file_id,
        caption: options.caption || "",
      });
    }

    if (message.document) {
      media.push({
        type: "document",
        media: message.document.file_id,
        caption: options.caption || "",
      });
    }

    if (message.animation) {
      media.push({
        type: "animation",
        media: message.animation.file_id,
        caption: options.caption || "",
      });
    }

    // If media is available, send it
    if (media.length === 1) {
      await bot.telegram.sendMediaGroup(chatId, media);
    } else if (media.length > 1) {
      await bot.telegram.sendMediaGroup(chatId, media);
    }

    // Send standalone text message
    if (message.text && !media.length) {
      await bot.telegram.sendMessage(chatId, message.text, options);
    }

    // Send sticker if present
    if (message.sticker) {
      await bot.telegram.sendSticker(chatId, message.sticker.file_id);
    }

    // Send location if present
    if (message.location) {
      await bot.telegram.sendLocation(
        chatId,
        message.location.latitude,
        message.location.longitude
      );
    }

    // Send contact if present
    if (message.contact) {
      await bot.telegram.sendContact(
        chatId,
        message.contact.phone_number,
        message.contact.first_name,
        message.contact.last_name || ""
      );
    }

    // Send poll if present
    if (message.poll) {
      await bot.telegram.sendPoll(
        chatId,
        message.poll.question,
        message.poll.options.map((o) => o.text),
        { is_anonymous: message.poll.is_anonymous }
      );
    }
  } catch (error) {
    if (!adminState.announcementErrorSent) {
      console.log("Error inside");
      await adminCtx.reply("An error occurred. Please try again.");
      console.error("Announcement error:\n", error);
      adminState.announcementErrorSent = true; // Prevent multiple error messages
      adminState.announcementFailed = true;
      showAdminMenu(adminCtx);
    }
  }
};
