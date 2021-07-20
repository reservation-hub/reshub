import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUserList } from '../../store/actions/userAction'
import UserList from '../../components/user/UserList'

const Users = () => {

  const dispatch = useDispatch()
  const { users } = useSelector(state => state.user)
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated)
  
  useEffect(() => {
    dispatch(fetchUserList())
  }, [dispatch])

  if (!isAuthenticated) return null

  return (
    <main>
      <UserList
        users={ users.docs }
      />
    </main>
  )
}

export default Users