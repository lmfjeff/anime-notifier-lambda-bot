import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb"
import { isDev } from "../utils/config.js"

const ddbClient = new DynamoDBClient({
  ...(isDev
    ? {
        endpoint: process.env.DYNAMODB_ENDPOINT,
      }
    : {}),
})

const marshallOptions = {
  convertEmptyValues: false,
  removeUndefinedValues: true,
  convertClassInstanceToMap: true,
}

const unmarshallOptions = {
  wrapNumbers: false,
}

const translateConfig = { marshallOptions, unmarshallOptions }

const ddbDocClient = DynamoDBDocument.from(ddbClient, translateConfig)

export { ddbDocClient }
