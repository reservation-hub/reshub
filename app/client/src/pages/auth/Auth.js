import React, { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import Login from '../../components/auth/LoginForm'
import { loginStart } from '../../store/actions/authAction'
import useInput from '../../utils/useInput'

const Auth = () => {

  const dispatch = useDispatch()

  const [value, setValue] = useInput({
    email: '', password: ''
  })

  const onSubmit = useCallback(e => {
    e.preventDefault()
    dispatch(loginStart(value.email, value.password))
  }, [dispatch, value.email, value.password])
  
  return(
    <Login 
      value={ value } 
      setValue={ setValue } 
      onSubmit={ onSubmit } 
    />
  ) 
}

export default Auth