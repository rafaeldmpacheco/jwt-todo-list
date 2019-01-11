const _ = require('lodash');
const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const cryptoJS = require("crypto-js");

// {
//    alg: "HS256",
//    typ: "JWT"
// }

var keyJwt = 'secret-key-jwt';
var keyUser = 'secret-key-user';

var TODOS = [
    { 'id': 1, 'user_id': 1, 'name': "Trabalho de Segurança", 'completed': false },
    { 'id': 2, 'user_id': 1, 'name': "Projeto TCC", 'completed': true },
    { 'id': 3, 'user_id': 2, 'name': "Trabalho de IHC", 'completed': false },
    { 'id': 4, 'user_id': 2, 'name': "Projeto TCC", 'completed': false },
];

var USERS = [
    { 'id': 1, 'username': 'rafael', 'password': cryptoJS.AES.encrypt('rafael', keyUser) },
    { 'id': 2, 'username': 'andre', 'password': cryptoJS.AES.encrypt('andre', keyUser) }
];

function getTodos(userID) { 
    var todos = _.filter(TODOS, ['user_id', userID]);
    return todos;
}

function getTodo(todoID) {
    var todo = _.find(TODOS, function (todo) { return todo.id == todoID; })
    return todo;
}

function getUsers() {
    let userCopy = [];

    USERS.forEach(item => {
        userCopy.push({
            username: item.username,
            password: cryptoJS.AES.decrypt(item.password, keyUser).toString(cryptoJS.enc.Utf8)
        })
    })
    return userCopy;
}

app.use(bodyParser.json());
app.use(expressJwt({ secret: keyJwt }).unless({ path: ['/api/auth'] }));

app.get('/', function (req, res) {
    res.send('API Server')
});

app.post('/api/auth', function (req, res) {
    const body = req.body;
    const user = USERS.find(user => user.username == body.username);

    if (!user || body.password != cryptoJS.AES.decrypt(user.password, keyUser).toString(cryptoJS.enc.Utf8)) {
        return res.sendStatus(401)
    };

    var token = jwt.sign({ userID: user.id }, keyJwt, { expiresIn: '2h' });
    res.send({ token });
});

app.get('/api/todos', function (req, res) {
    res.type("json");
    res.send(getTodos(req.user.userID));
});

app.get('/api/todos/:id', function (req, res) {
    var todoID = req.params.id;
    res.type("json");
    res.send(getTodo(todoID));
});

app.get('/api/users', function (req, res) {
    res.type("json");
    res.send(getUsers());
});

app.listen(4000, function () {
    console.log('API Server listening on port 4000!')
});
