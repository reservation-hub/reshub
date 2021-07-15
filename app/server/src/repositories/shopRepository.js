const pluralize = require('pluralize')
const { Types: { ObjectId } } = require('mongoose')
const { Shop } = require('../models/shop')

const lookupParam = param => [{
  $lookup: {
    from: pluralize(param),
    localField: param,
    foreignField: '_id',
    as: param,
  },
}, { $unwind: `$${param}` }]

module.exports = {
  fetchByCount(count, populate = true) {
    const foreignKeys = populate ? ['area', 'prefecture', 'city'] : []
    return Shop.find().limit(parseInt(count, 10)).populate(foreignKeys).exec()
  },
  fetchByAreaSlug({ area: areaSlug }) {
    return Shop.aggregate([...lookupParam('area'), { $match: { 'area.slug': areaSlug } }])
  },
  fetchByAreaAndPrefectureSlugs({ area: areaSlug, prefecture: prefectureSlug }) {
    return Shop.aggregate([
      ...lookupParam('area'),
      ...lookupParam('prefecture'),
      {
        $match: {
          'area.slug': areaSlug,
          'prefecture.slug': prefectureSlug,
        },
      },
    ])
  },
  fetchByAreaAndPrefectureAndCitySlugs({
    area: areaSlug,
    prefecture: prefectureSlug,
    city: cityId,
  }) {
    return Shop.aggregate([
      ...lookupParam('area'),
      ...lookupParam('prefecture'),
      ...lookupParam('city'),
      {
        $match: {
          'area.slug': areaSlug,
          'prefecture.slug': prefectureSlug,
          'city._id': ObjectId(cityId),
        },
      },
    ])
  },
  fetchById({
    area: areaSlug, prefecture: prefectureSlug, city: cityId, shop: _id,
  }) {
    return Shop.aggregate([
      ...lookupParam('area'),
      ...lookupParam('prefecture'),
      ...lookupParam('city'),
      {
        $match: {
          'area.slug': areaSlug,
          'prefecture.slug': prefectureSlug,
          'city._id': ObjectId(cityId),
          _id: ObjectId(_id),
        },
      },
    ])
  },
}
