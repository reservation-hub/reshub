const todayString = new Date().toLocaleString('en-us', { timeZone: 'Asia/Tokyo', hour12: false })
const today = new Date(todayString)

export default today
