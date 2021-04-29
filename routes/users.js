var express = require('express');
var router = express.Router();

const users =  {
    1: {
      id: 1,
      name: 'Eugene'
    }, 
    2: {
      id: 2,
      name: 'Fumina'
    }
  }
  
/* GET users listing. */
router.get('/', (req, res) => {
  return res.send(Object.values(users));
});

router.get('/:userId', (req, res, next) => {
  console.log(next)
  return res.send(users[req.params.userId])
})

router.post('/', (req, res) => {
  return res.send('Post HTTP Method with Users Resource');
})

router.put('/', (req, res) => {
  return res.send('Put HTTP Method with Users Resource');
})

router.delete('/', (req, res) => {
  return res.send('Delete HTTP Method with Users Resource');
})

module.exports = router;
