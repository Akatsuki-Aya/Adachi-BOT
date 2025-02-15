import lodash from "lodash";
import { checkAuth } from "#utils/auth";
import { hasEntrance } from "#utils/config";
import { guessPossibleNames } from "#utils/tools";
import { doGacha } from "./gacha.js";
import { getName, getPool } from "./name.js";
import { doPool } from "./pool.js";
import { doSelect, doSelectNothing, doSelectWhat } from "./select.js";

async function Plugin(msg) {
  switch (true) {
    case hasEntrance(msg.text, "gacha", "pool"): {
      const name = getPool(msg);
      const guess = guessPossibleNames(name, lodash.flatten(Object.values(global.command.functions.options.pool)));
      if ((undefined === name || guess.length > 0) && false !== checkAuth(msg, "pool")) {
        doPool(msg, 1 === guess.length ? guess[0] : name);
      }
      break;
    }
    case hasEntrance(msg.text, "gacha", "gacha"):
      if (false !== checkAuth(msg, "gacha")) {
        const times = parseInt((msg.text.match(/[0-9]+/g) || [10])[0]);
        doGacha(msg, lodash.sortBy([10, 180, times])[1]);
      }
      break;
    case hasEntrance(msg.text, "gacha", "gacha10"):
      if (false !== checkAuth(msg, "gacha")) {
        doGacha(msg, 10);
      }
      break;
    case hasEntrance(msg.text, "gacha", "select-what"):
      if (false !== checkAuth(msg, "select-what")) {
        doSelectWhat(msg);
      }
      break;
    case hasEntrance(msg.text, "gacha", "select-nothing"):
      if (false !== checkAuth(msg, "select-nothing")) {
        doSelectNothing(msg);
      }
      break;
    case hasEntrance(msg.text, "gacha", "select"): {
      const name = getName(msg);
      const guess = name ? guessPossibleNames(name, global.names.weapon) : "null";
      if (guess.length > 0 && false !== checkAuth(msg, "select")) {
        doSelect(msg, name && (1 === guess.length ? guess[0] : name));
      }
      break;
    }
  }
}

export { Plugin as run };
