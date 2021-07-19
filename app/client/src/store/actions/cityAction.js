import apiEndpoint from '../../utils/api/apiEndpoint'
import {
  CITY_REQUEST_START,
  CITY_REQUEST_SUCCESS,
  CITY_REQUEST_FAILURE
} from '../types/cityTypes'

const cityRequestStart = () => {
  return {
    type: CITY_REQUEST_START
  }
}

const fetchCity = city => {
  return {
    type: CITY_REQUEST_SUCCESS,
    payload: city
  }
}

const cityRequestFailure = err => {
  return {
    type: CITY_REQUEST_FAILURE,
    paylaod: err
  }
}

export const getCity = () => async dispatch => {

  dispatch(cityRequestStart())
  try {
    const res = await apiEndpoint.getCities()
    dispatch(fetchCity(res.data))
  } catch (e) {
    dispatch(cityRequestFailure(e.response.data))
  }

}

export const getOneCity = id => async dispatch => {

  dispatch(cityRequestStart())
  try {
    const res = await apiEndpoint.getOneCities(id)
    dispatch(fetchCity(res.data))
  } catch (e) {
    dispatch(cityRequestFailure(e.response.data))
  }
  
}