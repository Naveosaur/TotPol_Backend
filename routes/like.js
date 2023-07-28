const express = require('express');
const { db } = require('../services/db');
const router = express.Router();



// TODO: handle klo misal banyak org ngelike pada saat yang sama (jumlah like nya gabener?)
// add likes
router.put('/:id',(req,res) => {
    var id = req.params.id; 

    var queryString =`UPDATE news SET likes = likes+1 WHERE id_news =${id}`;

    db.query(queryString,(err,result) => {
        if (err){
            res.status(400).send('error updating likes column');
        }
        else{
            res.status(200).send('sucsessfully updated data');
        }
    })
});


module.exports = router;