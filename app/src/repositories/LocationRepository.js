const prisma = require('../db/prisma')
const CommonRepository = require('./CommonRepository')

module.exports = {
  async locationsAreValid(areaID, prefectureID, cityID) {
    try {
      const count = await prisma.city.count({
        where: {
          prefecture: {
            id: prefectureID,
            area: { id: areaID },
          },
          id: cityID,
        },
      })
      return { value: count !== 0 }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
  async fetchAllAreas(page = 0, order = 'asc', filter) {
    try {
      const { error, value: data } = await CommonRepository.fetchAll('area', page, order, filter)
      if (error) throw error
      return { value: data }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
  async fetchAllPrefectures(page = 0, order = 'asc', filter) {
    try {
      const { error, value: data } = await CommonRepository.fetchAll('prefecture', page, order, filter)
      if (error) throw error
      return { value: data }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
  async fetchAllCities(page = 0, order = 'asc', filter) {
    try {
      const { error, value: data } = await CommonRepository.fetchAll('city', page, order, filter)
      if (error) throw error
      return { value: data }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
  async fetchAreaCount(filter) {
    try {
      const { error, value: count } = await CommonRepository.totalCount('area', filter)
      if (error) throw error
      return {
        value: count,
      }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
  async fetchPrefectureCount(filter) {
    try {
      const { error, value: count } = await CommonRepository.totalCount('prefecture', filter)
      if (error) throw error
      return {
        value: count,
      }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
  async fetchCityCount(filter) {
    try {
      const { error, value: count } = await CommonRepository.totalCount('city', filter)
      if (error) throw error
      return {
        value: count,
      }
    } catch (error) {
      console.error(`Exception : ${error}`)
      return { error }
    }
  },
}
