const express = require('express');
const app = express();

const admin = require('./routes/admin.js');
const superadmin = require('./routes/superadmin.js');

const newsRouter = require('./routes/ news');
const likeRouter = require('./routes/like');
const commentRouter = require('./routes/comments');
const reactionRouter = require('./routes/reaction');
const userRouter = require('./routes/user')

//set CORS
app.use((req,res,next) =>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
})
// Try to use admin service
app.use('/api/admin',admin);
app.use('/api/super-admin',superadmin)


app.use(express.json())
app.use('/api/news',newsRouter);
app.use('/api/like',likeRouter);
app.use('/api/comment',commentRouter);
app.use('/api/reaction',reactionRouter);
app.use('/api/user',userRouter);

app.get('/api/test',(req,res) =>{
    res.send({result:"it works"})
})

const port = process.env.PORT || 3000;
app.listen(port,() => console.log(`Listening on port ${port}`));
