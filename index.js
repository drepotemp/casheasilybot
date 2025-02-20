const { Telegraf } = require("telegraf");
require("dotenv/config");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const Queue = require("queue-promise");

const handleError = require("./helpers/handleError");
const replyFirstTimer = require("./helpers/replyFirstTimer");
const User = require("./models/userModel");
const isMemberOfGroup = require("./helpers/isMemberOfGroup");
const isMemberOfChannel = require("./helpers/isMemberOfChannel");
const createUser = require("./helpers/createUser");
const handleReferral = require("./helpers/handleReferral");
const alreadyReferred = require("./helpers/alreadyReferred");
const showMenu = require("./helpers/showMenu");
const isSameDay = require("./helpers/isSameDay");
const showAdminMenu = require("./helpers/showAdminMenu");
const announce = require("./helpers/announce");
const botStart = require("./helpers/botStart");
const adminAuth = require("./helpers/adminAuth");
const Task = require("./models/taskModel");

// Create a queue instance
const queue = new Queue({
  concurrent: 25, // Process one request at a time
  interval: 3000, // Interval between dequeue operations (1 second)
});

global.queue = queue;

const app = express();
const groupId = process.env.GROUP_ID;
const channelId = process.env.CHANNEL_ID;

app.use(
  cors({
    origin: "*",
  })
);

// Parse URL-encoded bodies (deprecated in Express v4.16+)
app.use(bodyParser.urlencoded({ extended: false }));

// Parse JSON bodies
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});

mongoose
  .connect(process.env.URI, { dbName: "casheasily_db" })
  .then(() => {
    console.log("Connected to db.");
  })
  .catch((err) => {
    console.log(`Error connecting to db: ${err}`);
  });

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(async (ctx) => {
  botStart(ctx, bot);
});

bot.action("verify_join", async (ctx) => {
  queue.enqueue(async () => {
    const chatId = ctx.from.id;
    const instruction =
      "⚠️*You haven't joined all our channels and groups yet!*";
    try {
      //Check group membership
      const isGroupMember = await isMemberOfGroup(bot, groupId, chatId);
      if (!isGroupMember.success) {
        return await ctx.reply("An error occured. Please try again later.");
      }

      if (isGroupMember.success) {
        if (!isGroupMember.result) {
          await ctx.reply(instruction, { parse_mode: "Markdown" });
          return await replyFirstTimer(ctx);
        }
      }

      //Check channel membership
      const isChannelMember = await isMemberOfChannel(bot, channelId, chatId);
      if (!isChannelMember.success) {
        return await ctx.reply("An error occured. Please try again later.");
      }

      if (isChannelMember.success) {
        if (!isChannelMember.result) {
          await ctx.reply(instruction, { parse_mode: "Markdown" });
          return await replyFirstTimer(ctx);
        }
      }

      //Check if they were referred by someone
      const alreadyReferredCheck = await alreadyReferred(chatId);

      //If they've already been referred by someone
      if (alreadyReferredCheck.result) {
        const whoReferredMe = await User.findOne({
          referrals: { $elemMatch: { chatId: chatId } },
        });
        if (whoReferredMe) {
          const { first_name, last_name, username } = ctx.from;
          let name = ``;
          if (first_name) {
            name += first_name;
          }

          if (!first_name) {
            if (last_name) {
              name += last_name;
            }
          }

          if (!first_name && !last_name) {
            name += username;
          }

          //Credit referrer
          whoReferredMe.balance += 0.8;
          await whoReferredMe.save();

          //Notify referrer
          const message = `You have recieved *$0.8* from ${name}`;
          await bot.telegram.sendMessage(whoReferredMe.chatId, message, {parse_mode:"Markdown"});
        }
      }

      await showMenu(ctx);
    } catch (error) {
      handleError(ctx, error);
    }
  });
});

bot.hears("💰 Balance", async (ctx) => {
  queue.enqueue(async () => {
    try {
      const { first_name, last_name, username } = ctx.from;
      let name = ``;
      if (first_name) {
        name += first_name;
      }

      if (!first_name) {
        if (last_name) {
          name += last_name;
        }
      }

      if (!first_name && !last_name) {
        name += username;
      }

      const userDetails = await User.findOne({ chatId: ctx.from.id });
      if (userDetails) {
        const message = `🙌🏻 *User = ${name}*\n\n💰 *Balance = $${userDetails.balance}*\n\n🪢 *Perform Tasks, Invite Friends To Earn More*`;
        await ctx.reply(message, { parse_mode: "Markdown" });
      }
    } catch (error) {
      handleError(ctx, error);
    }
  });
});

bot.hears("👩‍❤️‍👩 Invite", async (ctx) => {
  queue.enqueue(async () => {
    try {
      const userDetails = await User.findOne({ chatId: ctx.from.id });
      if (userDetails) {
        const message = `🙌🏻 *Total Refers = ${userDetails.referrals.length} User(s)*\n\n🙌🏻 *Your Invite Link = ${userDetails.referralLink}*\n\n*🪢 Invite to Earn $0.8 Per Invite*`;
        await ctx.reply(message, {
          parse_mode: "Markdown",
          disable_web_page_preview: true,
          reply_markup: {
            inline_keyboard: [
              [
                { text: "🔍 My Refers", callback_data: "my_refers" },
                { text: "🔥 Top List", callback_data: "top_list" },
              ],
            ],
            resize_keyboard: true,
          },
        });
      }
    } catch (error) {
      handleError(ctx, error);
    }
  });
});

bot.hears("🏧 Withdraw", async (ctx) => {
  queue.enqueue(async () => {
    try {
      await ctx.reply(
        "💸 _Withdrawal portal is closed, Portal opens by 5pm-6pm._",
        { parse_mode: "Markdown" }
      );
    } catch (error) {
      handleError(ctx, error);
    }
  });
});

bot.hears("🖨️ Withdrawal Record", async (ctx) => {
  queue.enqueue(async () => {
    try {
      await ctx.reply("🔴You have no withdrawal records yet.");
    } catch (error) {
      handleError(ctx, error);
    }
  });
});

bot.hears("✍️ About DEXHALE ADS", async (ctx) => {
  queue.enqueue(async () => {
    try {
      const message = `*✅ WELCOME TO DEXHALE ADS 💸💸*

EARN A WHOOPING OF $0.8 FOR EVERY PERSON YOU REFER 🧒🧒

Use the bot everyday and earn a daily bonus of $0.4💴

Complete tasks daily and watch your earnings grow with each successful accomplishment. 🚀💰

@dexhale 

https://t.me/dexhaletechs
`;
      await ctx.reply(message, {
        disable_web_page_preview: true,
        parse_mode:"Markdown"
      });
    } catch (error) {
      handleError(ctx, error);
    }
  });
});

bot.hears("📁 Task", async (ctx) => {
  queue.enqueue(async () => {
    try {
      const message = `Please select an option from the menu below ⬇️

All tasks available:`;

      await ctx.reply(message, {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Tiktok",
                callback_data: "do_tiktok",
              },
            ],
            [
              {
                text: "Whatsapp",
                callback_data: "do_whatsapp",
              },
            ],
            [
              {
                text: "Telegram",
                callback_data: "do_telegram",
              },
            ],
            [
              {
                text: "Other",
                callback_data: "do_other",
              },
            ],
          ],
          resize_keyboard: true,
        },
      });
    } catch (error) {
      handleError(ctx, error);
    }
  });
});

bot.hears("📊 Statistics", async (ctx) => {
  queue.enqueue(async () => {
    const allUsers = await User.find();

    try {
      const message = `
      📊 Total members : ${allUsers.length} Users
      
➕ Total successful withdrawals : $0  
      
📲Bot was developed by @dexhaletechs📲`;
      await ctx.reply(message);
    } catch (error) {
      handleError(ctx, error);
    }
  });
});

bot.hears("🎁 Daily Bonus", async (ctx) => {
  queue.enqueue(async () => {
    try {
      const userDetails = await User.findOne({ chatId: ctx.from.id });
      const lastClaimTime = userDetails.lastBonusDate;
      //If user hasn't claimed before
      if (!lastClaimTime) {
        const message = `
        🎁 Congrats! *You've received a bonus of $0.4*
        
        🔍 Check back after 24 hours to claim again!`;
        userDetails.balance += 0.4;
        userDetails.lastBonusDate = new Date();
        await userDetails.save();

        return await ctx.reply(message, { parse_mode: "Markdown" });
      }

      const hasClaimedToday = isSameDay(Date.now(), userDetails.lastBonusDate);
      if (hasClaimedToday) {
        await ctx.reply(
          "🚫 You have already received your bonus in the last 24 hours. Please try again later."
        );
      } else {
        const message = `
        🎁 Congrats! *You've received a bonus of $0.4*
        
        🔍 Check back after 24 hours to claim again!`;
        userDetails.balance += 0.4;
        userDetails.lastBonusDate = new Date();
        await userDetails.save();

        return await ctx.reply(message, { parse_mode: "Markdown" });
      }
    } catch (error) {
      handleError(ctx, error);
    }
  });
});

let taskSent = null;
let acceptingTaskProof = false;
bot.action("do_tiktok", async (ctx) => {
  queue.enqueue(async () => {
    try {
      await ctx.answerCbQuery();
      await ctx.deleteMessage();
      const taskInDb = await Task.find();
      const task = taskInDb[0];

      if (!task.tiktok) {
        return await ctx.reply("No tiktok task yet. come back later");
      }

      await bot.telegram.copyMessage(
        ctx.from.id,
        task.tiktok.chatId,
        task.tiktok.messageId,
        {
          disable_web_page_preview: true,
        }
      );
      taskSent = "Tiktok";
      ctx.reply("Click the button below to submit your screenshot👇", {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Submit task",
                callback_data: "submit",
              },
            ],
          ],
          resize_keyboard: true,
        },
      });
    } catch (error) {
      if (error.response.error_code == 400) {
        ctx.reply("That task is unavailable for now. Come back later.");
        console.log("Task message was deleted");
      } else {
        handleError(ctx, error);
      }
    }
  });
});
bot.action("do_whatsapp", async (ctx) => {
  queue.enqueue(async () => {
    try {
      await ctx.answerCbQuery();
      await ctx.deleteMessage();
      const taskInDb = await Task.find();
      const task = taskInDb[0];

      if (!task.whatsapp) {
        return await ctx.reply("No whatsapp task yet. come back later");
      }

      await bot.telegram.copyMessage(
        ctx.from.id,
        task.whatsapp.chatId,
        task.whatsapp.messageId,
        {
          disable_web_page_preview: true,
        }
      );
      taskSent = "Whatsapp";
      ctx.reply("Click the button below to submit your screenshot👇", {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Submit task",
                callback_data: "submit",
              },
            ],
          ],
          resize_keyboard: true,
        },
      });
    } catch (error) {
      if (error.response.error_code == 400) {
        ctx.reply("That task is unavailable for now. Come back later.");
        console.log("Task message was deleted");
      } else {
        handleError(ctx, error);
      }
    }
  });
});
bot.action("do_telegram", async (ctx) => {
  queue.enqueue(async () => {
    try {
      await ctx.answerCbQuery();
      await ctx.deleteMessage();
      const taskInDb = await Task.find();
      const task = taskInDb[0];

      if (!task.telegram) {
        return await ctx.reply("No telegram task yet. come back later");
      }

      await bot.telegram.copyMessage(
        ctx.from.id,
        task.telegram.chatId,
        task.telegram.messageId,
        {
          disable_web_page_preview: true,
        }
      );
      taskSent = "Telegram";
      ctx.reply("Click the button below to submit your screenshot👇", {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Submit task",
                callback_data: "submit",
              },
            ],
          ],
          resize_keyboard: true,
        },
      });
    } catch (error) {
      if (error.response.error_code == 400) {
        ctx.reply("That task is unavailable for now. Come back later.");
        console.log("Task message was deleted");
      } else {
        handleError(ctx, error);
      }
    }
  });
});
bot.action("do_other", async (ctx) => {
  queue.enqueue(async () => {
    try {
      await ctx.answerCbQuery();
      await ctx.deleteMessage();
      const taskInDb = await Task.find();
      const task = taskInDb[0];

      if (!task.other) {
        return await ctx.reply("No other task yet. come back later");
      }

      await bot.telegram.copyMessage(
        ctx.from.id,
        task.other.chatId,
        task.other.messageId,
        {
          disable_web_page_preview: true,
        }
      );
      taskSent = "Other";
      ctx.reply("Click the button below to submit your screenshot👇", {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Submit task",
                callback_data: "submit",
              },
            ],
          ],
          resize_keyboard: true,
        },
      });
    } catch (error) {
      if (error.response.error_code == 400) {
        ctx.reply("That task is unavailable for now. Come back later.");
        console.log("Task message was deleted");
      } else {
        handleError(ctx, error);
      }
    }
  });
});

bot.action("submit", async (ctx) => {
  queue.enqueue(async () => {
    await ctx.answerCbQuery();
    await ctx.deleteMessage();
    try {
      await ctx.reply(`📸 Please submit a screenshot as proof to verify your ${taskSent} task.

Send the photo here, and we'll review it shortly.`);
      acceptingTaskProof = true;
    } catch (error) {
      handleError(ctx, error);
    }
  });
});
bot.action("my_refers", async (ctx) => {
  queue.enqueue(async () => {
    try {
      await ctx.reply("Fetching your referrals. Please wait...");
      const me = await User.findOne({ chatId: ctx.from.id });
      let referralsList = ``;
      for (const referral of me.referrals) {
        let name = ``;
        const { firstname, lastname, username } = referral;
        if (username) {
          name += `@${username}`;
        } else if (lastname) {
          name += lastname;
        } else {
          name += firstname;
        }
        referralsList += `\n👤 ${name}\n`;
      }

      const referralsCount = me.referrals.length;
      let message = `➡️ Your Total Referrals: ${referralsCount}`;
      if (referralsCount > 0) {
        referralsCount += `\n\n👨‍👨‍👦 Your Reffer Users ⬇️\n${referralsList} `;
      }

      await ctx.reply(message, { parse_mode: "Markdown" });
    } catch (error) {
      handleError(ctx, error);
    }
  });
});

bot.action("top_list", async (ctx) => {
  queue.enqueue(async () => {
    try {
      await ctx.reply("Fetching top list. Please wait...");
      let leaderboard = ``;
      const topReferrers = await User.aggregate([
        {
          $addFields: {
            referralCount: { $size: "$referrals" }, // Calculate referral count
          },
        },
        {
          $sort: { referralCount: -1 }, // Sort by referral count in descending order
        },
        {
          $limit: 10, // Limit to top 10
        },
        {
          $project: {
            firstname: 1,
            lastname: 1,
            username: 1,
            referrals: 1, // Keep full referral array if needed
            referralCount: 1, // Optionally keep count
          },
        },
      ]);

      for (let i = 0; i < topReferrers.length; i++) {
        let name = ``;
        const { firstname, lastname, username, referrals } = topReferrers[i];
        if (username) {
          name += `@${username}`;
        } else if (lastname) {
          name += lastname;
        } else {
          name += firstname;
        }
        leaderboard += `${i + 1}. ${name}: 👨 ${referrals.length}\n`;
      }

      await ctx.reply(
        `<b>Top Referring Users list:</b>
\n${leaderboard}`,
        { parse_mode: "HTML" }
      );
    } catch (error) {
      handleError(ctx, error);
    }
  });
});

let adminState = {
  sendingAnnouncement: false,
  takingTiktok: false,
  takingWhatsapp: false,
  takingTelegram: false,
  takingOther: false,
  confirmingAnnouncement: false,
  announcementCache: null,
  announcementErrorSent: false,
  announcementFailed: false,
  takingTaskMessage: false,
};

bot.command("admin_mode", async (ctx) => {
  if (!adminAuth(ctx)) {
    return ctx.reply("You must be an admin to do this!");
  }
  queue.enqueue(async () => {
    try {
      await ctx.reply("Welcome to Admin mode!👮‍♂️");
      await showAdminMenu(ctx);
    } catch (error) {
      handleError(ctx, error);
    }
  });
});

bot.command("user_mode", async (ctx) => {
  if (!adminAuth(ctx)) {
    return ctx.reply("You are in user mode🙂");
  }
  queue.enqueue(async () => {
    try {
      await ctx.reply("Welcome to user mode!🙂");
      botStart(ctx, bot);
    } catch (error) {
      handleError(ctx, error);
    }
  });
});

bot.hears("🔊 Announcement", async (ctx) => {
  if (!adminAuth(ctx)) {
    return ctx.reply("You must be an admin to do this!");
  }
  queue.enqueue(async () => {
    try {
      adminState.sendingAnnouncement = true;
      await ctx.reply("Send me the message you want to announce.");
    } catch (error) {
      handleError(ctx, error);
    }
  });
});

bot.hears("✅ Send", async (ctx) => {
  if (!adminAuth(ctx)) {
    return ctx.reply("You must be an admin to do this!");
  }
  queue.enqueue(async () => {
    try {
      if (adminState.confirmingAnnouncement && adminState.announcementCache) {
        await ctx.reply("Sending announcement🔊 Please wait...", {
          reply_markup: {
            keyboard: [
              [
                {
                  text: "🔊 Announcement ongoing...",
                },
              ],
            ],
            resize_keyboard: true,
          },
        });
        const allUsers = await User.find();
        let messageToSend = adminState.announcementCache;

        for (const user of allUsers) {
          queue.enqueue(async () => {
            await announce(bot, user.chatId, messageToSend, ctx, adminState);
          });
        }

        adminState.announcementErrorSent = false; //reset this after announcement fn is done executing
        if (!adminState.announcementFailed) {
          // Reset announcement state
          adminState.confirmingAnnouncement = false;
          adminState.announcementCache = null;
          await ctx.reply("Announcement sent to all users ✅");
          await showAdminMenu(ctx);
          adminState.announcementFailed = false;
          adminState.sendingAnnouncement = false;
        }
      }
    } catch (error) {
      console.log("error outside");
      handleError(ctx, error);
    }
  });
});

bot.hears("❌ Cancel", async (ctx) => {
  if (!adminAuth(ctx)) {
    return ctx.reply("You must be an admin to do this!");
  }
  queue.enqueue(async () => {
    try {
      adminState.confirmingAnnouncement = false;
      adminState.announcementCache = null;
      await ctx.reply("Announcement cancelled ❌");
      await showAdminMenu(ctx);
    } catch (error) {
      handleError(ctx, error);
    }
  });
});

bot.hears("📝 Tiktok task", async (ctx) => {
  if (!adminAuth(ctx)) {
    return ctx.reply("You must be an admin to do this!");
  }
  queue.enqueue(async () => {
    try {
      adminState.takingTaskMessage = { active: true, taskType: "Tiktok" };
      await ctx.reply("Send me the tiktok task.");
    } catch (error) {
      handleError(ctx, error);
    }
  });
});

bot.hears("📝 Telegram task", async (ctx) => {
  if (!adminAuth(ctx)) {
    return ctx.reply("You must be an admin to do this!");
  }
  queue.enqueue(async () => {
    try {
      adminState.takingTaskMessage = { active: true, taskType: "Telegram" };
      await ctx.reply("Send me the telegram task.");
    } catch (error) {
      handleError(ctx, error);
    }
  });
});

bot.hears("📝 Whatsapp task", async (ctx) => {
  if (!adminAuth(ctx)) {
    return ctx.reply("You must be an admin to do this!");
  }
  queue.enqueue(async () => {
    try {
      adminState.takingTaskMessage = { active: true, taskType: "Whatsapp" };
      await ctx.reply("Send me the whatsapp task.");
    } catch (error) {
      handleError(ctx, error);
    }
  });
});

bot.hears("📝 Other task", async (ctx) => {
  if (!adminAuth(ctx)) {
    return ctx.reply("You must be an admin to do this!");
  }
  queue.enqueue(async () => {
    try {
      adminState.takingTaskMessage = { active: true, taskType: "Other" };
      await ctx.reply("Send me the other task.");
    } catch (error) {
      handleError(ctx, error);
    }
  });
});

bot.on("message", async (ctx) => {
  queue.enqueue(async () => {
    let messageRecieved = ctx.message;
    try {
      //Sending announcement
      if (adminState.sendingAnnouncement) {
        adminState.announcementCache = messageRecieved;
        adminState.sendingAnnouncement = false;
        adminState.confirmingAnnouncement = true;
        return await ctx.reply(
          "Are you sure you want to annount this message to all users?",
          {
            reply_markup: {
              keyboard: [
                [
                  {
                    text: "❌ Cancel",
                  },
                  {
                    text: "✅ Send",
                  },
                ],
              ],
              resize_keyboard: true,
            },
          }
        );
      }

      //Saving task
      if (adminState?.takingTaskMessage?.active) {
        let task = await Task.find();
        let newTaskInstance = null;
        if (!task) {
          newTaskInstance = new Task({});
          await newTaskInstance.save();
        }
        task = await Task.find();
        let taskInDb = task[0];
        console.log(taskInDb);

        switch (adminState.takingTaskMessage.taskType) {
          case "Tiktok":
            taskInDb.tiktok.messageId = messageRecieved.message_id;
            taskInDb.tiktok.chatId = messageRecieved.chat.id;
            break;
          case "Whatsapp":
            taskInDb.whatsapp.messageId = messageRecieved.message_id;
            taskInDb.whatsapp.chatId = messageRecieved.chat.id;
            break;
          case "Telegram":
            taskInDb.telegram.messageId = messageRecieved.message_id;
            taskInDb.telegram.chatId = messageRecieved.chat.id;
            break;
          case "Other":
            taskInDb.other.messageId = messageRecieved.message_id;
            taskInDb.other.chatId = messageRecieved.chat.id;
            break;
        }
        //Save task
        await taskInDb.save();
        await ctx.reply(
          adminState.takingTaskMessage.taskType + " task saved✅"
        );
        adminState.takingTaskMessage = null;
      }

      if (acceptingTaskProof) {
        await ctx.reply(
          `✅ Your ${taskSent} task screenshot has been submitted for review. You will be notified once it's reviewed.`
        );
        acceptingTaskProof = false;
        taskSent = null;
      }
    } catch (error) {
      handleError(ctx, error);
    }
  });
});

bot.telegram.setMyCommands([
  { command: "start", description: "Start the Casheasily Bot" },
  { command: "admin_mode", description: "Enter admin mode(admins only)" },
  { command: "user_mode", description: "Enter user mode(admins only)" },
]);

// Log a message when the bot is connected
bot.telegram
  .getMe()
  .then((botInfo) => {
    console.log(`Bot ${botInfo.username} is connected and running.`);
    bot.launch();
  })
  .catch((err) => {
    console.error("Error connecting bot:", err);
  });
