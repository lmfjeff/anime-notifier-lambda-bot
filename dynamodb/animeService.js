import { nanoid } from "nanoid"
import { pastSeasons } from "../utils/date.js"
import { ddbDocClient } from "./ddbDocClient.js"

export async function getAnimesByStatus(request) {
  const { year, season } = request
  if (!year || !season) throw Error("Need to specify search year and season")

  const yearSeason = `${year}-${season}`
  let allAnimes = []
  let nextCursor

  do {
    const input = {
      TableName: "Animes",
      IndexName: "StatusIndex",
      Limit: 100,
      ExpressionAttributeValues: {
        ":status": "currently_airing",
      },
      KeyConditionExpression: "#status = :status",
      ...(nextCursor ? { ExclusiveStartKey: JSON.parse(nextCursor) } : {}),
      ProjectionExpression:
        "id,yearSeason,title,picture,alternative_titles,startDate,endDate,summary,genres,#type,#status,dayOfWeek,#time,#source,studios,numEpisodes,malId",
      ExpressionAttributeNames: {
        "#time": "time",
        "#type": "type",
        "#status": "status",
        "#source": "source",
      },
    }
    const response = await ddbDocClient.query(input)
    allAnimes = [...allAnimes, ...response.Items]
    nextCursor = JSON.stringify(response.LastEvaluatedKey)
    if (!response.LastEvaluatedKey || !response.Items) {
      break
    }
  } while (nextCursor)

  const filteredAnimes = allAnimes.filter((anime) =>
    pastSeasons(yearSeason, 3).includes(anime.yearSeason)
  )

  return {
    animes: filteredAnimes,
  }
}

export async function getAnimesBySeason(request) {
  const { year, season } = request
  if (!year || !season) throw Error("Need to specify search year and season")

  const yearSeason = `${year}-${season}`
  let allAnimes = []
  let nextCursor

  do {
    const input = {
      TableName: "Animes",
      IndexName: "YearSeasonIndex",
      Limit: 100,
      ExpressionAttributeValues: {
        ':yearSeason': yearSeason,
      },
      KeyConditionExpression: 'yearSeason = :yearSeason',
      ...(nextCursor ? { ExclusiveStartKey: JSON.parse(nextCursor) } : {}),
      ProjectionExpression:
        "id,yearSeason,title,picture,alternative_titles,startDate,endDate,summary,genres,#type,#status,dayOfWeek,#time,#source,studios,numEpisodes,malId",
      ExpressionAttributeNames: {
        "#time": "time",
        "#type": "type",
        "#status": "status",
        "#source": "source",
      },
    }
    const response = await ddbDocClient.query(input)
    allAnimes = [...allAnimes, ...response.Items]
    nextCursor = JSON.stringify(response.LastEvaluatedKey)
    if (!response.LastEvaluatedKey || !response.Items) {
      break
    }
  } while (nextCursor)

  // const filteredAnimes = allAnimes.filter((anime) =>
  //   pastSeasons(yearSeason, 3).includes(anime.yearSeason)
  // )

  return {
    animes: allAnimes,
  }
}

// async function test() {
//   const resp = await getAnimesByStatus()
//   console.log(resp.animes.length)
//   // console.log(resp)
// }

// test()

// todo implement yup validation (server side / client side?)
export async function updateAnime(request) {
  const { anime } = request
  const now = new Date()

  let update_expression = "set #updatedAt = :updatedAt,"
  let expression_attribute_names = { "#updatedAt": "updatedAt" }
  let expression_attribute_values = { ":updatedAt": now.toISOString() }

  // set update input based on request.anime object
  for (const property in anime) {
    if (property !== "id") {
      update_expression += ` #${property} = :${property},`
      expression_attribute_names["#" + property] = property
      expression_attribute_values[":" + property] = anime[property]
    }
  }
  update_expression = update_expression.slice(0, -1)

  const input = {
    TableName: "Animes",
    Key: { id: anime.id },
    UpdateExpression: update_expression,
    ExpressionAttributeNames: expression_attribute_names,
    ExpressionAttributeValues: expression_attribute_values,
  }
  await ddbDocClient.update(input)
}

export async function createAnime(request) {
  const { anime } = request
  const now = new Date()

  const input = {
    TableName: "Animes",
    Item: {
      ...anime,
      id: nanoid(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
  }

  await ddbDocClient.put(input)
}

export async function getAnimeByMalId(request) {
  const { malId } = request

  const input = {
    TableName: "Animes",
    IndexName: "MalIdIndex",
    Limit: 1,
    ExpressionAttributeValues: {
      ":malId": malId,
    },
    KeyConditionExpression: "malId = :malId",
    ProjectionExpression:
      "id,yearSeason,title,picture,alternative_titles,startDate,endDate,summary,genres,#type,#status,dayOfWeek,#time,#source,studios,numEpisodes,malId",
    ExpressionAttributeNames: {
      "#time": "time",
      "#type": "type",
      "#status": "status",
      "#source": "source",
    },
  }

  const resp = await ddbDocClient.query(input)
  return {
    anime: resp.Items?.[0] || null,
  }
}
