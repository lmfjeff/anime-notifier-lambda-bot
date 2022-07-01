import { seasonOption } from "../constants/animeOption.js"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc.js"
import timezone from "dayjs/plugin/timezone.js"
dayjs.extend(utc)
dayjs.extend(timezone)

export function pastSeason({ year, season }) {
  const seasonIndex = seasonOption.indexOf(season || "")
  return seasonIndex === 0
    ? {
        year: (parseInt(year || "") - 1).toString(),
        season: seasonOption[seasonOption.length - 1],
      }
    : { year, season: seasonOption[seasonIndex - 1] }
}

export function nextSeason({ year, season }) {
  const seasonIndex = seasonOption.indexOf(season || "")
  return seasonIndex === seasonOption.length - 1
    ? { year: (parseInt(year || "") + 1).toString(), season: seasonOption[0] }
    : { year, season: seasonOption[seasonIndex + 1] }
}

// convert yearSeason to array of past N seasons
// e.g. '2022-spring' -> ['2021-summer', '2021-autumn', '2022-winter']
export function pastSeasons(season, numOfSeason) {
  const [yr, sn] = season.split("-")
  const lastSeason = pastSeason({ year: yr, season: sn })
  const lastSeasonString = `${lastSeason.year}-${lastSeason.season}`
  if (numOfSeason === 1) {
    return [lastSeasonString]
  } else {
    return [...pastSeasons(lastSeasonString, numOfSeason - 1), lastSeasonString]
  }
}

export function month2Season(n) {
  let season
  if (n >= 1 && n <= 3) {
    season = "winter"
  }
  if (n >= 4 && n <= 6) {
    season = "spring"
  }
  if (n >= 7 && n <= 9) {
    season = "summer"
  }
  if (n >= 10 && n <= 12) {
    season = "autumn"
  }
  return season
}

export function gethkNow() {
  return dayjs().tz("Asia/Hong_Kong")
}

export function getYearSeason() {
  const today = gethkNow()
  const year = today.year()
  const season = month2Season(today.month() + 1)
  return { year, season }
}

export function getYearMonth() {
  const today = gethkNow()
  const year = today.year()
  const monthIndex = today.month()

  const adjustedMonth = Math.floor(monthIndex / 3) * 3 + 1
  const adjustedMonthString = adjustedMonth.toString().padStart(2, "0")
  return `${year}${adjustedMonthString}`
}
