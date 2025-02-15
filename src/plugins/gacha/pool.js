import lodash from "lodash";
import db from "#utils/database";
import { init } from "./init.js";

function doPool(msg, name) {
  const isPool = (poolID, name) =>
    Array.isArray(global.all.functions.options.pool[poolID])
      ? global.all.functions.options.pool[poolID].includes(name)
      : global.all.functions.options.pool[poolID] === name;
  let choice = 301;

  switch (true) {
    case isPool(200, name):
      choice = 200;
      break;
    case isPool(400, name):
      choice = 400;
      break;
    case isPool(301, name):
      choice = 301;
      break;
    case isPool(302, name):
      choice = 302;
      break;
    case isPool(999, name):
      choice = 999;
      break;
    default: {
      const message = `所有卡池：${lodash.flatten(Object.values(global.all.functions.options.pool)).join("、")}。`;
      msg.bot.say(msg.sid, message, msg.type, msg.uid, true);
      return;
    }
  }

  init(msg.uid);
  db.update("gacha", "user", { userID: msg.uid }, { choice });
  msg.bot.say(msg.sid, `您的卡池已切换至：${name}。`, msg.type, msg.uid, true);
}

export { doPool };
