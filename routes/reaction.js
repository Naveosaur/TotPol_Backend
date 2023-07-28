const express = require('express');
const router = express.Router();
const {db} = require('../services/db');

router.post('/',(req,res)=>{
    var reaction_type = req.body.reaction_type;
    var id_news = req.body.id_news;
    var id_user = req.body.id_user;
    
    var queryString = `INSERT INTO reaction (content,id_user) VALUES (?,?)`

    db.query(queryString,[reaction_type,id_user],(err,result) => {
        if (err) {
            res.status(400).send('error inserting to reaction table');
        }
        else{
            
            var reaction_id = result.insertId;

            var queryInsert = `INSERT INTO news_has_reaction (id_news,id_reaction) VALUES (?,?)`

            db.query(queryInsert,[id_news,reaction_id],(err,result)=>{
                if (err) {
                    throw err;
                }
                else{
                    res.send('Insert success');
                }
            });
        }
    })
});

module.exports = router;