import { 
  TableRow,
  TableCell  
} from '@material-ui/core'

const UserItem = ({
  userNo,
  userFirstname,
  userLastname,
  userEmail
}) => {
  return (
    <TableRow>
      <TableCell>
        { userNo + 1 }
      </TableCell>
      <TableCell>
        { userFirstname } { userLastname }
      </TableCell>
      <TableCell>
        { userEmail }
      </TableCell>
    </TableRow>
  )
}

export default UserItem
