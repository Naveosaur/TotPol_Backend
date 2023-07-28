const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const {db} = require('../services/db.js');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));


// get admin list
router.get('/admin-list', (req, res) => {
    const query = `SELECT a.id_user,CONCAT(a.fname," ",a.lname) as fullname,a.email,a.no_telp,b.role,a.is_active,
                    FROM user AS a INNER JOIN role as b on a.id_role = b.id_role WHERE b.role = "admin" `;
    db.query(query, (err, rows, field) => {
        if (err) {
            return res.status(500).json({ message: 'Gagal mengambil data!', error: err });
        }
        res.status(201).json({ success: true, message: 'Berhasil mengambil data!', data: rows });
    });
});

// get author list
router.get('/author-list', (req, res) => {
    const query = `SELECT a.id_user,CONCAT(a.fname," ",a.lname) as fullname,a.email,a.no_telp,b.role,a.is_active,
                    FROM user AS a INNER JOIN role as b on a.id_role = b.id_role WHERE b.role = "author" `;
    db.query(query, (err, rows, field) => {
        if (err) {
            return res.status(500).json({ message: 'Gagal mengambil data!', error: err });
        }
        res.status(201).json({ success: true, message: 'Berhasil mengambil data!', data: rows });
    });
});

// get editor list
router.get('/editor-list', (req, res) => {
    const query = `SELECT a.id_user,CONCAT(a.fname," ",a.lname) as fullname,a.email,a.no_telp,b.role,a.is_active,
                    FROM user AS a INNER JOIN role as b on a.id_role = b.id_role WHERE b.role = "editor" `;
    db.query(query, (err, rows, field) => {
        if (err) {
            return res.status(500).json({ message: 'Gagal mengambil data!', error: err });
        }
        res.status(201).json({ success: true, message: 'Berhasil mengambil data!', data: rows });
    });
});

//get user list
router.get('/user-list', (req, res) => {
    const query = `SELECT a.id_user,CONCAT(a.fname," ",a.lname) as fullname,a.email,b.role,a.is_active,
                    FROM user AS a INNER JOIN role as b on a.id_role = b.id_role WHERE b.role = "user" `;
    db.query(query, (err, rows, field) => {
        if (err) {
            return res.status(500).json({ message: 'Gagal mengambil data!', error: err });
        }
        res.status(201).json({ success: true, message: 'Berhasil mengambil data!', data: rows });
    });
});

// search user name
router.get('/search-user/:name',(req,res) => {
    var searchKey = req.params.name;
    const query = `SELECT a.id_user,CONCAT(a.fname," ",a.lname) as fullname,a.email,b.role,a.is_active,
            FROM user AS a INNER JOIN role as b on a.id_role = b.id_role WHERE b.role = "user" And fullname LIKE '%"+searchKey+"%'`;
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

// add roles
router.post('/add-roles', (req, res) => {
    const jsonBody = { ...req.body };
    const query = 'INSERT INTO role SET ?';
    
    db.query(query, jsonBody, (err, rows, field) => {
        if (err) {
            return res.status(500).json({ message: 'Gagal menambahkan role!', error: err });
        }
        res.status(201).json({ success: true, message: 'Berhasil menambahkan role!' });
    });
} );

//
module.exports = router;