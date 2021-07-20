const { shopSchema } = require('../schemas/shop')

module.exports = {
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
