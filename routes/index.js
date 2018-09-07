var express = require('express');
var router = express.Router();
var debug = require('debug')('app:tracker');

var mysql = require('mysql');
var connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DB
});


/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({ name: 'node-ghost-tracker', version: '1.0.0' });
});

const resultCount = (query) => {
  return new Promise((resolve, reject) => {
    connection.query({
      sql: 'SELECT COUNT(`title`) FROM `posts` WHERE (`plaintext` REGEXP ? OR `title` REGEXP ?) AND `status`=?',
      timeout: 40000, // 40s
      values: [query, query, 'published']
    }, function (error, results, fields) {
      if (error) return reject(error)
      resolve(results)
    });
  })
}

const resultData = (query, page, limit) => {
  return new Promise((resolve, reject) => {
    connection.query({
      sql: 'SELECT `title`, `slug`, `updated_at`, `plaintext` FROM `posts` WHERE (`plaintext` REGEXP ? OR `title` REGEXP ?) AND `status`=? order by `updated_at` limit ?,?',
      timeout: 40000, // 40s
      values: [query, query, 'published', page, limit]
    }, function (error, results, fields) {
      if (error) return reject(error)
      resolve(results)
    });
  })
}

router.get('/search', function(req, res, next) {
  const query = req.query.q || null
  const page = req.query.p || 0
  const limit = req.query.l || 30
  resultCount(query)
    .then(result => {
      if (result.length > 0) return resultData(query, page, limit)
    })
    .then(result => {
      res.json(result)
    }).catch(err => {
      next(err)
    })
});

module.exports = router;
