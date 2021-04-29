module.exports = {
    fetchAll: function(callback) {
        this.find({}).exec()
        .then(results => {
            if (!results.length) {
                return {data: results, status: 404}
            }
            console.log(results)
            return {data: results, status: 200}
        })
        .catch(e => ({data: e, status: 500}))
    },
    show: function(id) {
        return this.findById(id).exec()
    },
    insert: function(data, cb) {
        const model = new this(data)
        model.save(cb)
    },
}