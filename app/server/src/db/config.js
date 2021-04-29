const dbOptions = {
    useNewUrlParser: true,
    useCreateIndex: true,
    dbName: 'message-board',
    user: 'root',
    pass: 'root',
    auth: {
        authdb: 'admin'
    },
    useUnifiedTopology: true,
    useFindAndModify: false,
}
const DB_HOST = 'mongodb://root:root@db:27017/admin'

module.exports = {
    dbOptions,
    DB_HOST
}