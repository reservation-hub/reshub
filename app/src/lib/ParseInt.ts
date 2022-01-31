const parseToInt = (s?: string): number | undefined => {
  const num = s ? parseInt(s, 10) : undefined
  if (undefined !== num && Number.isNaN(num)) {
    return undefined
  }
  return num
}

export default parseToInt
