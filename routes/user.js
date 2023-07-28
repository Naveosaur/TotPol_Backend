const express = require('express');
const { db } = require('../services/db');
const router = express.Router();

// get total like of news by user
router.get('/likes/:id_user',(req,res) => {
    var id = req.params.id_user;

    var queryString = `SELECT username,SUM(likes) AS total_likes FROM user
                        NATURAL JOIN news
                        WHERE id_user=${id}
                        GROUP BY id_user`

    db.query(queryString,(err,result) =>{
        if (err) throw err;
        res.send(JSON.parse(JSON.stringify(result)));
    });
});

module.exports = router;