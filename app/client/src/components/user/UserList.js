import React from 'react'
import {
  Paper, 
  Table,
  TableHead, 
  TableBody, 
  TableRow,
  TableCell,
  Typography  
} from '@material-ui/core'
import UserItem from './UserItem'

const UserList = ({ users }) => {
  return (
    <Paper>
      <Typography variant='h4'>
        User List
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              No
            </TableCell>
            <TableCell>
              UserName
            </TableCell>
            <TableCell>
              Email
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          { users && users.map(
            (user, index) => (
              <UserItem 
                key={ index }
                userNo={ index }
                userFirstname={ user.firstName }
                userLastname={ user.lastName }
                userEmail={ user.email }
              />
            )
          ) }
        </TableBody>
      </Table>
    </Paper>
  )
}

export default UserList
