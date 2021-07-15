const dbOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  dbName: process.env.DB_NAME,
  user: process.env.DB_USER,
  pass: process.env.DB_PASS,
  auth: {
    authdb: process.env.DB_AUTH_DB,
  },
  useUnifiedTopology: true,
  useFindAndModify: false,
}
const { DB_HOST } = process.env

module.exports = {
  dbOptions,
  DB_HOST,
}
