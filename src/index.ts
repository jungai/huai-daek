import "dotenv/config";
import { load } from "cheerio";
import got from "got";

const DISCORD_URL = process.env.DISCORD_URL || "prayut";
const SCRAPER_URL = process.env.SCRAPER_URL || "prayut";

if (DISCORD_URL === "prayut" || SCRAPER_URL === "prayut") {
  throw new Error("I HERE");
}

const { body: htmlStr } = await got.get(SCRAPER_URL);
const $ = load(htmlStr);

// find first lotto div
const list = $(".lotto-check__article")
  .map((_, el) => $(el).text().trim())
  .toArray()
  .map((text) => text.split(/\s/).filter(Boolean));

// a string[] length is 26
const latest = list.shift();

if (!latest) {
  throw new Error("SOMETHING_GO_WRONG");
}

const title = latest[0];
const date = `ประจำวันที่ ${latest[1]} ${latest[2]} ${latest[3]}`;
const firstPrice = latest[7];
const frontThreeDigits = `${latest[11]}, ${latest[12]}`;
const backThreeDigits = `${latest[16]}, ${latest[17]}`;
const backTwoDigits = latest[21];

// send to discord
await Promise.all(
  DISCORD_URL.split(",").map(
    async (url) =>
      await got.post(url, {
        json: {
          embeds: [
            {
              title,
              description: date,
              url: SCRAPER_URL,
              thumbnail: {
                url: "https://media3.giphy.com/media/SsTcO55LJDBsI/giphy.gif?cid=ecf05e47h4tz7lmoftkuebewdesy7j1bcvsna0fqvhobhfr4&rid=giphy.gif&ct=g",
              },
              fields: [
                {
                  name: "🚀 รางวัลที่ 1",
                  value: firstPrice,
                },
                {
                  name: "🔥 เลขหน้า 3 ตัว",
                  value: frontThreeDigits,
                },
                {
                  name: "🔥 เลขท้าย 3 ตัว",
                  value: backThreeDigits,
                },
                {
                  name: "🔥 เลขท้าย 2 ตัว",
                  value: backTwoDigits,
                },
              ],
            },
          ],
        },
      })
  )
);
