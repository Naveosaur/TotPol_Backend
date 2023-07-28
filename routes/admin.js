const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const {db} = require('../services/db.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { validateRegister, isLoggedIn } = require('../mid/auth.js');


router.use(bodyParser.json()); 
router.use(bodyParser.urlencoded({ extended: true }));


// get upcoming news
router.get('/get-upcoming-news',(req,res)=> {
    // make variables from the request body and sql query
    const query = 'SELECT a.title,b.username,a.created_at,a.is_premium,a.likes FROM news AS a INNER JOIN user AS b ON a.id_user = b.id_user WHERE id_role = 6 AND a.status = "Upcoming"';
    db.query(query, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Gagal mengambil data!', error: err });
        }
        res.status(201).json({ success: true, message: 'Berhasil mengambil data!', data: rows });
    })
});

// get on going news
router.get('/get-ongoing-news',(req,res)=> {
    // make variables from the request body and sql query
    const query = 'SELECT a.title,b.username,a.created_at,a.is_premium,a.likes FROM news AS a INNER JOIN user AS b ON a.id_user = b.id_user WHERE id_role = 6 AND a.status = "Ongoing"';
    db.query(query, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Gagal mengambil data!', error: err });
        }
        res.status(201).json({ success: true, message: 'Berhasil mengambil data!', data: rows });
    })
});

// get taken down news
router.get('/get-takendown-news',(req,res)=> {
    // make variables from the request body and sql query
    const query = 'SELECT a.title,b.username,a.created_at,a.is_premium,a.likes FROM news AS a INNER JOIN user AS b ON a.id_user = b.id_user WHERE id_role = 6 AND a.status = "Takedown"';
    db.query(query, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Gagal mengambil data!', error: err });
        }
        res.status(201).json({ success: true, message: 'Berhasil mengambil data!', data: rows });
    })
});

// Searching news by title
router.get('/search-news/:title',(req,res) => {
    var searchKey = req.params.title;
    const query = `SELECT a.title,b.username,a.created_at,a.is_premium,a.likes FROM news AS a INNER JOIN user AS b 
    ON a.id_user = b.id_user WHERE id_role = 6 AND a.title LIKE '%"+searchKey+"%'`;
    console.log(query);

    db.query(query,(err,rows) => {
        if (err) {
            return res.status(500).json({ message: 'Gagal mencari data!', error: err });
        }
        if (rows.length){
            res.status(200).json({success : true,message : 'Berhasil menemukan data!', data : rows} );
        }
        else{
            res.status(404).json({success : false,message : 'Data tidak ditemukan!'});
        }
    })
})

// Insert Subscription into Database
router.post('/add-subscription-package',(req,res)=> {
    // make variables from the request body and sql query
    const jsonBody = { ...req.body };
    const query = 'INSERT INTO subscribe SET ?';

    // run query
    db.query(query, jsonBody, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Gagal insert data!', error: err });
        }

        // jika request berhasil
        res.status(201).json({ success: true, message: 'Berhasil insert data!' });
    });
});

// Editing Subcription in Database
router.put('/update-subscribe/:id',(req,res)=> {
    // make variables from the request body and sql query
    const jsonBody = { ...req.body };
    const searchQuery = 'SELECT * FROM subscribe WHERE id_subscribe = ?';
    const updateQuery = 'UPDATE subscribe SET ? WHERE id_subscribe = ?';
    const id = req.params.id;

    // run query
    try{
        db.query(searchQuery,id, (err, rows, field) => {
            
            // error handling
            if (err) {
                return res.status(500).json({ message: 'Gagal update data!', error: err });
            }
            
            // Cek id apakah ada atau tidak
            if(rows.length){
                db.query(updateQuery,[jsonBody,id],(err, rows, field) => {
                    if(err){
                        return res.status(500).json({message : 'Ada kesalahaan',error : err});
                    }
                    else{
                        res.status(200).json({success : true,message : 'Berhasil update data!'});
                    }
                })
            }
            else{
                res.status(404).json({success : false,message : 'Data tidak ditemukan!'});
            }
        });
    }
    catch(err){
        console.log(err);
    }
});

// Delete Subcription from Database
router.delete('/delete-subcription/:id',(req,res)=> {
    // make variables from the request body and sql query
    const id = req.params.id;
    const query = 'DELETE FROM subscribe WHERE id_subscribe = ?';
    
    // run query
    db.query(query,id, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Gagal delete data!', error: err });
        }
        res.status(200).json({ success: true, message: 'Berhasil delete data!' });
    });
});

router.post('/login', (req, res, next) => {
    db.query('SELECT * FROM user WHERE username = ?', [req.body.username], (err, result) => {
        if(err) {
            res.status(400).send({
                msg: err
            });
        }        
        bcrypt.compare(req.body.password, result[0].password, (bErr, bResult) => {
            if(bErr) {
                res.status(401).send({
                    msg: 'username atau password salah'
                });
            }
            if(bResult) {
                const token  = jwt.sign({
                    username: result[0].username,
                    userId: result[0].id
                }, process.env.SECRETKEY, 
                { expiresIn: '1d' }
                )
                res.status(200).send({
                    msg: 'login berhasil',
                    token,
                    user: result[0]
                });
            }
            res.status(401).send({
                msg: 'username atau password salah2'
            });
        })
    });
});

// Test Register
router.post('/register', validateRegister, (req, res, next) => {
    db.query('SELECT id from users WHERE LOWER(username) = LOWER(?)', [req.body.username], (err, result) => {
        if(result) { // Belom jadi
            // Check username already exist

            res.status(409).send({
                msg: 'username sudah digunakan'
            })
        } else {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if(err) {
                    res.status(500).send({
                        msg: err
                    });
                } else {
                    db.query('INSERT INTO user (username, password) VALUES (?, ?)', [req.body.username, hash], (err, result) => {
                        if(err) {
                            res.status(400).send({
                                msg: err
                            });
                        }
                        res.status(201).send({
                            msg: 'user berhasil dibuat'
                        })
                    })
                }
            })
        }
    });
});


router.get('/home', isLoggedIn, (req, res, next) => {
    res.status(200).send({
        msg: 'home page harus login'
    });
});

module.exports = router;

// Update Data in Database
// router.put('/update-news/:id',(req,res)=> {
//     // make variables from the request body and sql query
//     const jsonBody = { ...req.body };
//     const searchQuery = 'SELECT * FROM news WHERE id_news = ?';
//     const updateQuery = 'UPDATE news SET ? WHERE id_news = ?';
//     const id = req.params.id;

//     // run query
//     try{
//         db.query(searchQuery,id, (err, rows, field) => {
            
//             // error handling
//             if (err) {
//                 return res.status(500).json({ message: 'Gagal update data!', error: err });
//             }
            
//             // Cek id apakah ada atau tidak
//             if(rows.length){
//                 db.query(updateQuery,[jsonBody,id],(err, rows, field) => {
//                     if(err){
//                         return res.status(500).json({message : 'Ada kesalahaan',error : err});
//                     }
//                     else{
//                         res.status(200).json({success : true,message : 'Berhasil update data!'});
//                     }
//                 })
//             }
//             else{
//                 res.status(404).json({success : false,message : 'Data tidak ditemukan!'});
//             }
//         });
//     }
//     catch(err){
//         console.log(err);
//     }
// });

// Delete Data from Database
// router.delete('/delete-news/:id',(req,res)=> {
//     // make variables from the request body and sql query
//     const id = req.params.id;
//     const query = 'DELETE FROM news WHERE id_news = ?';
    
//     // run query
//     db.query(query,id, (err, rows, field) => {
//         // error handling
//         if (err) {
//             return res.status(500).json({ message: 'Gagal delete data!', error: err });
//         }
//         res.status(200).json({ success: true, message: 'Berhasil delete data!' });
//     });
// });

module.exports = router;