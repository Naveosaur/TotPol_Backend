const express = require('express');
const { db } = require('../services/db');
const { route } = require('./user');
const {upload} = require('../services/cloudinaryStorage')
const router = express.Router();

// news list (all)
router.get('/list',(req,res) => {
    var queryString = `SELECT n.id_news,n.title,n.body,n.created_at,n.likes FROM user 
                        NATURAL JOIN news n 
                        ORDER BY n.created_at`;
    

    db.query(queryString,(err,result)=>{
        if (err) throw err;
        result = JSON.parse(JSON.stringify(result));
        var ret_value = result.map(element => {
            element.tags = getTags(element.body);
            return element;
        });
        res.send(ret_value);
    });
});

// news list by id
router.get('/detail/:id',(req,res) =>{
    var id = req.params.id;
    var queryString = `SELECT n.id_news,n.title,n.body,n.created_at,GROUP_CONCAT(file_path) AS files,username AS author, n.likes FROM user 
                        NATURAL JOIN news n NATURAL JOIN news_has_files NATURAL JOIN file WHERE n.id_news=?
                        GROUP BY n.id_news
                        ORDER BY n.created_at`

    db.query(queryString,[id],(err,result) => {
        if (err) throw err;
        result = (JSON.parse(JSON.stringify(result)));
        var ret_value = result.map(element => {
            element.files = element.files.split(',');
            return element;
        })
        res.send(ret_value);
    });
});

// news list by category
router.get('/list/:category',(req,res) => {
    var category = req.params.category;
    var queryString = `SELECT id_news,title,body,created_at,category,likes FROM news NATURAL JOIN news_has_category NATURAL JOIN category WHERE`
                        + ` category = ?`;
    db.query(queryString,[category],(err,result) =>{
        if (err) throw err;
        res.send(JSON.parse(JSON.stringify(result)));
    })
});

// get comments by news ID
router.get('/comments/:id',(req,res) => {
    var id = req.params.id;
    var queryString = `SELECT comment,username FROM news INNER JOIN news_has_comment ON news.id_news=news_has_comment.id_news `
                     + `INNER JOIN comment ON comment.id_comment=news_has_comment.id_comment `+
                     `INNER JOIN user ON comment.id_user=user.id_user WHERE news.id_news=${id}`;

    db.query(queryString,(err,result) => {
        if (err) throw err;
        res.send(JSON.parse(JSON.stringify(result)))
    })
});

// get comments of editor role
router.get('/feedback/:id',(req,res) => {
    var id = req.params.id;
    var queryString = `SELECT comment AS feedback,username FROM news INNER JOIN news_has_comment ON news.id_news=news_has_comment.id_news `
                     + `INNER JOIN comment ON comment.id_comment=news_has_comment.id_comment `+
                     `INNER JOIN user ON comment.id_user=user.id_user INNER JOIN role on user.id_role=role.id_role 
                     WHERE news.id_news=${id} AND role.role='author'`;

    db.query(queryString,(err,result) =>{
        if (err) throw err;
        res.send(JSON.parse(JSON.stringify(result)));
    })
});

// get pictures of news
router.get('/pictures/:id',(req,res) => {
    var id = req.params.id;
    var queryString = `SELECT n.id_news,GROUP_CONCAT(file_path) AS pictures FROM news n 
                        NATURAL JOIN news_has_files 
                        NATURAL JOIN file 
                        WHERE n.id_news=? AND RIGHT(file_path,3) IN ('png','jpg','jpeg')
                        GROUP BY n.id_news
                        ORDER BY n.created_at`;
    db.query(queryString,[id],(err,result) =>{
        if (err) throw err;
        result = JSON.parse(JSON.stringify(result));
        var ret_value = result.map(element => {
            element.pictures = element.pictures.split(',');
            return element;
        });
        res.send(ret_value);
    })
    

    
});

// get video of news
router.get('/videos/:id',(req,res) => {
    var id = req.params.id
    var queryString = `SELECT n.id_news,GROUP_CONCAT(file_path) AS videos FROM news n 
                        NATURAL JOIN news_has_files 
                        NATURAL JOIN file 
                        WHERE n.id_news=? AND RIGHT(file_path,3) IN ('mp4','vlc','.mov')
                        GROUP BY n.id_news
                        ORDER BY n.created_at`;

    db.query(queryString,[id],(err,result) =>{
        if (err) throw err;
        res.send(JSON.parse(JSON.stringify(result)));
    })
});

router.post('/upload',upload.array('files'),(req,res)=>{
    var id_user = req.body.id_user
    var title = req.body.title
    var bodyText = req.body.bodyText

    queryNews = `INSERT INTO news (id_user,title,body,created_at,likes,is_premium,status) VALUES
                (?,?,?,NOW(),0,false,'Upcoming');`

    db.query(queryNews,[id_user,title,bodyText],(err,result_news)=>{
        if (err) throw err;
        var id_news = result_news.insertId

        var i = 0
        req.files.forEach(element => {
            var queryFile = `INSERT INTO file(file_path) VALUES (?)`
            
            db.query(queryFile,[element.path],(err,result_file)=>{
                if (err) throw err;
                var id_file = result_file.insertId;
                var queryNewsHasFiles = `INSERT INTO news_has_files(id_news,id_file) VALUES (?,?)`                

                db.query(queryNewsHasFiles,[id_news,id_file],(err,resultNHF)=>{
                    if(err) throw err;
                    res.status(200).send('INSERT NEWS SUCCESS')
                })
            })
        });
    })
})

function getTags(bodyText){
    var res = '';
    var idx_tag = bodyText.indexOf('#');

    bodyText = bodyText.slice(idx_tag);

    res = bodyText.split('#');
    res.shift();

    var ret_value = res.map(tag =>{
        tag = tag.replace(/\W/g, '');
        return tag;
    })

    return ret_value;
}
module.exports = router;