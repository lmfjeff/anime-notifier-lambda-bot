import { equals, isEmpty } from "ramda"

export function malAnime2DynamodbAnime(malAnime) {
  const {
    id,
    title,
    main_picture,
    alternative_titles,
    start_date,
    end_date,
    synopsis,
    genres,
    media_type,
    status,
    start_season,
    broadcast,
    source,
    studios,
    num_episodes,
  } = malAnime
  const year = start_season?.year
  const season =
    start_season?.season === "fall" ? "autumn" : start_season?.season
  const yearSeason = year && season ? `${year}-${season}` : null
  const dynamodbAnime = {
    yearSeason,
    title,
    picture: main_picture?.large || null,
    type: media_type,
    status,
    dayOfWeek: broadcast?.day_of_the_week || null,
    time: broadcast?.start_time || null,
    alternative_titles: alternative_titles || null,
    startDate: start_date || null,
    endDate: end_date || null,
    summary: synopsis || null,
    genres: genres?.map(({ name }) => name),
    source: source || null,
    studios: studios?.map(({ name }) => name),
    numEpisodes: num_episodes,
    malId: id.toString(),
  }
  return dynamodbAnime
}

export function newAnimeFromMal(oldAnime, newAnime) {
  const propsToUpdate = [
    "yearSeason",
    "picture",
    "type",
    "status",
    "dayOfWeek",
    "time",
    "alternative_titles",
    "startDate",
    "endDate",
    "genres",
    "source",
    "studios",
    "numEpisodes",
  ]
  const modifiedItem = {}
  // if the picture is relative path img/nanoid.webp, not update
  const regex = new RegExp(
    /^img\/[A-Za-z0-9_-]*\.(jpg|jpeg|png|webp|avif)/,
    "g"
  )
  for (const prop of propsToUpdate) {
    if (!equals(oldAnime[prop], newAnime[prop])) {
      if (prop === "picture" && regex.test(oldAnime[prop])) continue

      modifiedItem[prop] = newAnime[prop]
    }
  }
  if (isEmpty(modifiedItem)) return null
  return {
    id: oldAnime.id,
    ...modifiedItem,
  }
}

export function newAnimeFromAcg(oldAnime, newAnime) {
  const propsToUpdate = ["title", "summary"]
  const modifiedItem = {}
  for (const prop of propsToUpdate) {
    if (!equals(oldAnime[prop], newAnime[prop]) && newAnime[prop]) {
      modifiedItem[prop] = newAnime[prop]
    }
  }
  if (isEmpty(modifiedItem)) return null
  return {
    id: oldAnime.id,
    ...modifiedItem,
  }
}
