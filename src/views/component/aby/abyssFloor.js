// noinspection DuplicatedCode
import { html } from "../common/utils.js";
import characterShowbox from "./characterShowbox.js";

// eslint-disable-next-line no-undef
const { defineComponent } = Vue;

const chamberTemplate = html`
  <div class="container-vertical container-chamber-info">
    <div class="banner-title abyss-chamber-title">
      <div class="chamber-indicator">{{floorIndex}}<span>-</span>{{chamberIndex}}</div>
      <div class="chamber-stars">{{chamberStarCount}}</div>
      <div class="chamber-time" v-if="chamberTimestamp != 0">
        <p>{{formatDate(new Date(chamberTimestamp * 1000), "yy/MM/dd")}}</p>
        <p>
          <span>{{formatDate(new Date(chamberTimestamp * 1000), "hh")}}</span>
          <span class="kerning">:</span>
          <span>{{formatDate(new Date(chamberTimestamp * 1000), "mm")}}</span>
          <span class="kerning">:</span>
          <span>{{formatDate(new Date(chamberTimestamp * 1000), "ss")}}</span>
        </p>
      </div>
    </div>
    <div v-if="isValidChamberData" class="chamber-details valid">
      <div class="first-half">
        <characterShowbox
          v-for="character in chamberDetails[0]['avatars']"
          :htmlClass="'chamber-character'"
          :prefix="'Lv.'"
          :suffix="''"
          :data="character"
        />
      </div>
      <div class="second-half">
        <characterShowbox
          v-for="character in chamberDetails[1]['avatars']"
          :htmlClass="'chamber-character'"
          :prefix="'Lv.'"
          :suffix="''"
          :data="character"
        />
      </div>
    </div>
    <div v-else class="chamber-details invalid">
      <div class="missing-data-placeholder">暂无数据</div>
    </div>
  </div>
`;

const chamber = defineComponent({
  name: "abyssChamber",
  template: chamberTemplate,
  props: {
    chamber: Object,
    floorIndex: Number,
    index: Number,
  },
  components: {
    characterShowbox,
  },
  methods: {
    padLeftZero(str) {
      return ("00" + str).substring(str.length);
    },
    formatDate(date, fmt) {
      if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substring(4 - RegExp.$1.length));
      }
      const o = {
        "M+": date.getMonth() + 1,
        "d+": date.getDate(),
        "h+": date.getHours(),
        "m+": date.getMinutes(),
        "s+": date.getSeconds(),
      };
      for (const k in o) {
        if (new RegExp(`(${k})`).test(fmt)) {
          const str = o[k] + "";
          fmt = fmt.replace(RegExp.$1, 1 === RegExp.$1.length ? str : this.padLeftZero(str));
        }
      }
      return fmt;
    },
  },
  setup(props) {
    const chamber = props.chamber;
    const chamberIndex = props.index;
    const floorIndex = props.floorIndex;
    const chamberStars = chamber.max_star || 0;
    const chamberStarCount = "*".repeat(chamberStars);
    const chamberDetails = chamber.battles || [{}, {}];

    let chamberTimestamp = 0;
    if (chamberDetails.length > 0) {
      if (Object.prototype.hasOwnProperty.call(chamberDetails[0], "timestamp")) {
        chamberTimestamp = chamberDetails[0]["timestamp"];
      }
    }

    let isValidChamberData = false;
    const chamberProperties = ["avatars", "index", "timestamp"];

    if (chamberDetails.length === 2) {
      let validCount = 0;
      for (const details of chamberDetails) {
        for (const property of chamberProperties) {
          if (Object.prototype.hasOwnProperty.call(details, property)) {
            validCount++;
          }
        }
      }
      if (validCount === 6) {
        isValidChamberData = true;
      }
    }

    return {
      // eslint-disable-next-line vue/no-dupe-keys
      floorIndex,
      chamberIndex,
      chamberStarCount,
      isValidChamberData,
      chamberDetails,
      chamberTimestamp,
    };
  },
});

const template = html`
  <div class="card container-vertical container-floor-info">
    <chamber v-for="i in 3" :chamber="floorInfo.chambers[i-1] || {}" :floorIndex="floorInfo.floorIndex" :index="i" />
  </div>
`;

export default defineComponent({
  name: "abyssFloor",
  template: template,
  methods: {},
  components: {
    chamber,
  },
  props: {
    data: Object,
  },
  setup(props) {
    const params = props.data;
    let floorInfo = {};
    floorInfo.floorIndex = params.index || "X";
    floorInfo.chambers = params.levels;

    return {
      floorInfo,
    };
  },
});
