const pluralize = require('pluralize')
const { Shop } = require('../schemas/shop')

module.exports = {
  fetchByCount(count, populate = true) {
    const foreignKeys = populate ? ['area', 'prefecture', 'city'] : []
    return Shop.find().limit(parseInt(count, 10)).populate(foreignKeys).exec()
  },
  fetchByAreaSlug({ area: areaSlug }) {},
  fetchByAreaAndPrefectureSlugs({ area: areaSlug, prefecture: prefectureSlug }) {},
  fetchByAreaAndPrefectureAndCitySlugs({
    area: areaSlug,
    prefecture: prefectureSlug,
    city: cityId,
  }) {},
  fetchById({
    area: areaSlug, prefecture: prefectureSlug, city: cityId, shop: _id,
  }) {},
}
