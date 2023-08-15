const express = require('express')
const mongoose = require('mongoose')
// 引入加密依赖
const md5 = require('md5')
// 引入生成和验证token
const jwt =require('jsonwebtoken')
const cors = require('cors')

mongoose.connect('mongodb+srv://amy:348357jt@sneat.x1njkcn.mongodb.net/?retryWrites=true&w=majority')
mongoose.connection.on('open', () => {
    console.log('连接成功');
})
const registerSchema = new mongoose.Schema({
    fullname: String,
    password: String
})
const registerModel = mongoose.model('register', registerSchema)
const app = express()
// 自己定义的私钥
let secret = 'dsgrdhgfhgfj'
// 中间件
app.use(cors())
// 使用json和urlencoded中间件接收post传过来的json和表单数据，放在req.body
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
// 封装加密中间件
const encryption = (req, res, next) => {
    let password = req.body.password
    req.body.password = md5(password + md5(password).slice(3, 11))
    next()
}
// 注册接口
app.post('/api/v1/register', encryption, (req, res) => {
    registerModel.create(req.body).then((data) => {
        console.log(req.body);
        console.log('注册成功');
        res.send({
            code: 1,
            message: '注册成功',
            data: data
        })
    }).catch((err) => {
        console.log('注册失败');
        res.send({
            code: 0,
            message: '注册失败',
            data, err
        })
    })
})
// 登录接口
app.post('/api/v1/login', encryption, (req, res) => {
    console.log(req.body);


    registerModel.findOne(req.body).then((data) => {

        if (data) {
            res.send({
                code: 1,
                message: '登录成功',
                // 生成token返回，jsonwebtoken.sign(参数，加密串)
                token:jwt.sign({uid:data._id,exp:Math.ceil(Date.now()/1000) +7200},secret)
            })
        } else {
            res.send({
                code: 0,
                message: '登录失败',
            })
        }

    }).catch((err) => {
        console.log('登录失败');
        res.send({
            code: 0,
            message: '登录失败',
            data, err
        })
    })
})
app.listen(8080, () => {
    console.log('serve running');
})