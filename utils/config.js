import 'dotenv/config'
export const isDev = process.env.LAMBDA_ENV === "development"