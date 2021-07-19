import { 
  TableRow,
  TableCell  
} from '@material-ui/core'

const PrefectureItem = ({ preName, preNo }) => {
  return (
    <TableRow>
      <TableCell>
        { preNo }
      </TableCell>
      <TableCell>
        { preName }
      </TableCell>
    </TableRow>
  )
}

export default PrefectureItem
