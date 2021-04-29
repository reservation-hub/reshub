var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
  return res.send('Get HTTP Method');
});

router.post('/', (req, res) => {
  return res.send('Post HTTP Method');
})

router.put('/', (req, res) => {
  return res.send('Put HTTP Method');
})

router.delete('/', (req, res) => {
  return res.send('Delete HTTP Method');
})

module.exports = router;
