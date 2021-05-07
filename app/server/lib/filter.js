exports.filterUndefined = obj => {
  return Object.fromEntries(
    Object.entries(obj).filter(([key, val]) => {
      if (val) return val
    })
  )
}