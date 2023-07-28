const express = require('express');
const { db } = require('../services/db');
const router = express.Router();

// TODO: handle klo misal banyak orang comment pada saat yg sama (nanti id nya tabrakan?)
// add comments
router.post('/',(req,res) => {
    var id_news = req.body.id_news;
    var id_user = req.body.id_user;
    var comment = req.body.comment;

    console.log(id_news,id_user,comment)
    var queryString = `INSERT INTO comment (comment,id_user) VALUES (?,?)`

    db.query(queryString,[comment,id_user],(err,result) => {
        if (err) {
            res.status(400).send('error inserting to comment table');
        }
        else{
            var comment_id = result.insertId
            var queryComment = `INSERT INTO news_has_comment (id_news,id_comment) VALUES (?,?)`
            db.query(queryComment,[id_news,comment_id],(err,result)=>{
                if (err) {
                    throw err;
                }
                else{
                    res.send('Insert success')
                }
            })
        }
    })
    
})



module.exports = router;