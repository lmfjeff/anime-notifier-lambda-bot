import axios from "axios"
import * as cheerio from "cheerio"
import { getAnimeByMalId, updateAnime } from "./dynamodb/animeService.js"
import { getYearMonth } from "./utils/date.js"
import { newAnimeFromAcg } from "./utils/malUtils.js"

export async function handler() {
  const acgBaseUrl = "https://acgsecrets.hk/bangumi"
  const season = getYearMonth()
  
  const acgUrl = `${acgBaseUrl}/${season}`
  const { data } = await axios.get(acgUrl)

  const animeList = extractAnimeListFromAcgHtml(data)

  console.log("anime count: ", animeList)

  for (const newAnime of animeList) {
    const { title, summary, malId } = newAnime
    if (malId) {
      const { anime } = await getAnimeByMalId({ malId })
      if (anime) {
        const modifiedAnime = newAnimeFromAcg(anime, newAnime)
        if (!modifiedAnime) continue
        await updateAnime({ anime: modifiedAnime })
        console.log("Anime updated: ", anime.title)
        console.log("old: ", anime)
        console.log("new: ", newAnime)
        console.log("Changed: ", modifiedAnime)
      }
    }
  }
}

function extractAnimeListFromAcgHtml(data) {
  const $ = cheerio.load(data)
  const animeList = $("[acgs-bangumi-anime-id]")
    .map((index, el) => {
      const title = $(el).find(".entity_localized_name").first().text()
      const summary = $(el).find(".anime_story").text()

      const malId = $(el)
        .find(".anime_links")
        .children()
        .filter((index, el) => {
          const link = $(el).attr("href")
          return !!link?.includes("myanimelist")
        })
        .first()
        .attr("href")
        ?.match(/\d+/)?.[0]

      return {
        title,
        summary,
        malId,
      }
    })
    .toArray()
  return animeList
}
