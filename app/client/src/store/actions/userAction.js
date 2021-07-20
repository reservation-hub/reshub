//----------------------------------
// redux ユーザー状態管理 action
//----------------------------------

import apiEndpoint from '../../utils/api/apiEndpoint'
import { 
  USERS_REQUEST_START,
  USERS_FETCH_SUCCESS,
  USERS_GET_SUCCESS,
  USERS_ADD_SUCCESS,
  USERS_EDIT_SUCCESS,
  USERS_DELETE_SUCCESS,
  USERS_REQUEST_FAILURE
 } from '../types/usersType'


const userRequestStart = () => {
  return {
    type: USERS_REQUEST_START
  }
}

const userRequestFailure = err => {
  return {
    type: USERS_REQUEST_FAILURE,
    payload: err
  }
}

export const fetchUserList = () => async dispatch => {

  dispatch(userRequestStart())
  try {
    const res = await apiEndpoint.getUsers()
    dispatch({
      type: USERS_FETCH_SUCCESS,
      payload: res.data
    })
  } catch (e) {
    const error = e.response.data
    dispatch(userRequestFailure(error))
  }

}

export const getOneUser = id => async dispatch => {

  dispatch(userRequestStart())
  try {
    const res = await apiEndpoint.getOneUsers(id)
    dispatch({
      type: USERS_GET_SUCCESS,
      payload: res.data
    })
  } catch (e) {
    const error = e.response.data
    dispatch(userRequestFailure(error))
  }

}

export const addUser = (
  firstName,
  lastName,
  email,
  username,
  password 
) => async dispatch => {

  const userData = {
    firstName,
    lastName,
    email,
    username,
    password 
  } 

  dispatch(userRequestStart())
  try {
    const res = await apiEndpoint.addUser(userData)
    dispatch({
      type: USERS_ADD_SUCCESS,
      payload: res.data
    })
  } catch (e) {
    const error = e.response.data
    dispatch(userRequestFailure(error)) 
  }

}

export const patchUser = (
  id,
  firstName,
  lastName,
  email,
  username,
  password 
) => async dispatch => {

  const userData = {
    firstName,
    lastName,
    email,
    username,
    password 
  } 

  dispatch(userRequestStart())
  try {
    const res = await apiEndpoint.patchUser(id, userData)
    dispatch({
      type: USERS_EDIT_SUCCESS,
      payload: res.data
    })
  } catch (e) {
    const error = e.response.data
    dispatch(userRequestFailure(error)) 
  }

}

export const putUser = (
  id,
  firstName,
  lastName,
  email,
  username,
  password 
) => async dispatch => {

  const userData = {
    firstName,
    lastName,
    email,
    username,
    password 
  } 

  dispatch(userRequestStart())
  try {
    const res = await apiEndpoint.putUser(id, userData)
    dispatch({
      type: USERS_EDIT_SUCCESS,
      payload: res.data
    })
  } catch (e) {
    const error = e.response.data
    dispatch(userRequestFailure(error)) 
  }

}

export const deleteUser = id => async dispatch => {

  dispatch(userRequestStart())
  try {
    const res = await apiEndpoint.deleteUser(id)
    dispatch({
      type: USERS_DELETE_SUCCESS,
      payload: res.data
    })
  } catch (e) {
    const error = e.response.data
    dispatch(userRequestFailure(error)) 
  }
}