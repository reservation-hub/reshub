const prisma = require('./src/db/prisma');

(async () => {
  try {
    // TODO test order by
    const shops = await prisma.user.findMany({
      orderBy: {
        id: 'asc'
      },
    })
    console.log(shops)
  } catch (e) {
    console.error(e)
  } finally {
    process.exit()
  }
})()