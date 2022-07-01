import { getAnimesByStatus, updateAnime } from "./dynamodb/animeService.js"
import { getAnime, refreshToken } from "./mal/malApi.js"
import { getMalAuth, putMalAuth } from "./ssm/authService.js"
import { malAnime2DynamodbAnime, newAnimeFromMal } from "./utils/malUtils.js"
import "dotenv/config"
import { isDev } from "./utils/config.js"
import { getYearSeason } from "./utils/date.js"

export async function handler() {
  let malAuth
  if (isDev) {
    if (!process.env.MAL_AUTH) throw Error("no mal auth for testing")
    malAuth = JSON.parse(process.env.MAL_AUTH)
  } else {
    const oldMalAuth = await getMalAuth()
    malAuth = await refreshToken(oldMalAuth)
    await putMalAuth(malAuth)
  }

  const { year, season } = getYearSeason()

  const { animes } = await getAnimesByStatus({ year, season })

  for (const anime of animes) {
    if (anime.type !== "tv") continue
    const data = await getAnime(malAuth, anime.malId)
    const malAnime = malAnime2DynamodbAnime(data)

    const modifiedAnime = newAnimeFromMal(anime, malAnime)
    if (!modifiedAnime) continue
    await updateAnime({ anime: modifiedAnime })
    console.log("Anime updated: ", anime.title)
    console.log("old: ", anime)
    console.log("new: ", malAnime)
    console.log("Changed: ", modifiedAnime)
  }

  console.log("finish import")
}
