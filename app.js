import figlet from "figlet";
import lodash from "lodash";
import { createClient } from "oicq";
import { dispatch } from "#bot/dispatch";
import { init } from "#bot/init";
import { loadPlugins } from "#bot/plugin";
import { readConfig } from "#utils/config";
import { boardcast, say, sayMaster } from "#utils/oicq";

global.bots = [];

function create() {
  for (const account of global.config.accounts) {
    const bot = createClient(account.qq, { platform: account.platform, log_level: "debug" });

    bot.account = account;
    bot.boardcast = boardcast.bind(null, bot);
    bot.say = say.bind(null, bot);
    bot.sayMaster = sayMaster.bind(null, bot);
    // 属性 sendMessage 和 sendMessage 为了兼容可能存在的旧插件
    bot.sendMessage = async (id, msg, type = "private", sender = undefined, delimiter = " ", atSender = true) =>
      await bot.say(id, msg, type, sender, true, delimiter, atSender);
    bot.sendMaster = bot.sayMaster;

    global.bots.push(bot);
  }

  global.bots.logger = lodash.hasIn(global.bots, [0, "logger"]) ? global.bots[0].logger : () => {};
}

function hello() {
  const asciiArt = figlet.textSync(global.package.name, {
    font: "DOS Rebel",
    horizontalLayout: "full",
    verticalLayout: "full",
    width: 120,
    whitespaceBreak: true,
  });
  global.bots.logger.debug(`\n${asciiArt}\n\t\t\t项目主页：${global.package.homepage}`);
}

function report() {
  const log = (text) => global.bots.logger.debug(`配置：${text}`);

  log(`加载了 ${global.cookies.length} 条 Cookie 。`);
  log(`登录账号 ${lodash.map(global.config.accounts, "qq").join(" 、 ")} 。`);
  log(`管理者已设置为 ${global.config.masters.join(" 、 ")} 。`);
  log(
    0 === global.config.prefixes.length || global.config.prefixes.includes(null)
      ? "所有的消息都将被视为命令。"
      : `命令前缀设置为 ${global.config.prefixes.join(" 、 ")} 。`
  );
  log(`${2 === global.config.atMe ? "只" : 0 === global.config.atMe ? "不" : ""}允许用户 @ 机器人。`);
  log(`群回复将${1 === global.config.atUser ? "" : "不"}会 @ 用户。`);
  log(`群消息复读的概率为 ${(global.config.repeatProb / 100).toFixed(2)}% 。`);
  log(`上线${1 === global.config.groupHello ? "" : "不"}发送群通知。`);
  log(`${1 === global.config.groupGreetingNew ? "" : "不"}向新群友问好。`);
  log(`${1 === global.config.friendGreetingNew ? "" : "不"}向新好友问好。`);
  log(`${1 === global.config.noticeMysNews ? "" : "不"}推送米游社新闻。`);
  log(`角色查询${1 === global.config.characterTryGetDetail ? "尝试" : "不"}更新玩家信息。`);
  log(`耗时操作前${1 === global.config.warnTimeCosts ? "" : "不"}发送提示。`);
  log(`用户每隔 ${global.config.requestInterval} 秒可以使用一次机器人。`);
  log(
    `${
      global.config.deleteGroupMsgTime > 0 ? global.config.deleteGroupMsgTime + " 秒后" : "不"
    }尝试撤回机器人发送的群消息`
  );
  log(`广播中消息间时延 ${(global.config.boardcastDelay / 1000).toFixed(2)} 秒。`);
  log(`深渊记录将缓存 ${global.config.cacheAbyEffectTime} 小时。`);
  log(`玩家信息将缓存 ${global.config.cacheInfoEffectTime} 小时。`);
  log(`清理数据库 aby 中超过 ${global.config.dbAbyEffectTime} 小时的记录。`);
  log(`清理数据库 info 中超过 ${global.config.dbInfoEffectTime} 小时的记录。`);
  log(`${1 === global.config.viewDebug ? "" : "不"}使用前端调试模式。`);
  log(`${1 === global.config.saveImage ? "" : "不"}保存图片。`);
}

async function run() {
  const plugins = await loadPlugins();

  for (const bot of global.bots) {
    const events = [
      "system.online",
      "message.group",
      "message.private",
      "notice.friend.increase",
      "notice.group.increase",
    ];

    for (const e of events) {
      bot.on(e, (msg) => dispatch(msg, plugins, e, bot));
    }

    await new Promise((resolve) => {
      for (const e of ["system.online", "system.login.error"]) {
        bot.on(e, () => resolve());
      }

      if ("string" === typeof bot.account.password) {
        bot.on("system.login.slider", () =>
          process.stdin.once("data", (input) => {
            bot.sliderLogin(input.toString());
            resolve();
          })
        );
        bot.on("system.login.device", () => {
          bot.logger.info("在浏览器中打开网址，手机扫码完成后按下回车键继续。");
          process.stdin.once("data", () => {
            bot.login();
            resolve();
          });
        });
      } else {
        bot.on("system.login.qrcode", () => {
          bot.logger.mark("手机扫码完成后按下回车键继续。");
          process.stdin.once("data", () => {
            bot.login();
            resolve();
          });
        });
      }

      bot.login(bot.account.password);
    });
  }
}

(async function main() {
  readConfig();
  create();
  hello();
  report();
  await init();
  run();
})();
