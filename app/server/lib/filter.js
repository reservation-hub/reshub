exports.filterUndefined = obj => {
  return Object.fromEntries(
    Object.entries(obj).filter(([key, val]) => {
      if (val) return val
    })
  )
}

exports.filterForeignKey = obj => {
  return Object.keys(obj).filter(key => obj[key].instance === 'ObjectID' && key !== '_id')
}