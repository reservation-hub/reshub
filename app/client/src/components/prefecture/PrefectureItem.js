import { 
  TableRow,
  TableCell  
} from '@material-ui/core'

const PrefectureItem = ({ pre, preNo }) => {
  return (
    <TableRow>
      <TableCell>
        { preNo }
      </TableCell>
      <TableCell>
        { pre.name }
      </TableCell>
    </TableRow>
  )
}

export default PrefectureItem
