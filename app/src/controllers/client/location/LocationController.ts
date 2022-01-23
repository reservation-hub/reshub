import { Area, Prefecture, City } from '@entities/Location'
import LocationService from '@client/location/services/LocationService'
import { LocationControllerInterface } from '@controller-adapter/client/Location'

export type LocationServiceInterface = {
  fetchAreas(): Promise<Area[]>
  fetchAreaWithPrefectures(areaId: number): Promise<Area & { prefectures: Prefecture[] }>
  fetchPrefectureWithCities(prefectureId: number): Promise<Prefecture & { cities: City[] }>
}

const LocationController : LocationControllerInterface = {
  async areaList() {
    return LocationService.fetchAreas()
  },

  async areaPrefectures(areaId) {
    const area = await LocationService.fetchAreaWithPrefectures(areaId)
    return {
      areaId: area.id,
      name: area.name,
      slug: area.slug,
      prefectures: area.prefectures,
    }
  },

  async prefectureCities(prefectureId) {
    const prefecture = await LocationService.fetchPrefectureWithCities(prefectureId)
    return {
      prefectureId: prefecture.id,
      name: prefecture.name,
      slug: prefecture.slug,
      cities: prefecture.cities,
    }
  },

}

export default LocationController
