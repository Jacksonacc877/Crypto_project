var express = require('express');
var ejs = require('ejs');
var bodyParser = require('body-parser');
var mongojs = require('mongojs');
var path = require('path');
const paillier = require('./public/js/paillier');
const bigInt = require('big-integer');

var db = mongojs('eauction', ['bids']);

var index = require('./routes/index');
var buyer = require('./routes/buyer');
var seller = require('./routes/seller');
var tasks = require('./public/js/tasks');

var app = express();

const {
    publicKey,
    privateKey
} = paillier.generateRandomKeys(512);
var flag = 0,
    n = 0;

let num = 20000;
let num1 = 5000;
let num2 = 2000;
let num3 = 4000;
let num4 = 6000;

let bn = bigInt(num).mod(publicKey.n);
while (bn.lt(0)) bn = bn.add(publicKey.n);
let bn1 = bigInt(num1).mod(publicKey.n);
while (bn1.lt(0)) bn1 = bn1.add(publicKey.n);
let bn2 = bigInt(num2).mod(publicKey.n);
while (bn2.lt(0)) bn2 = bn2.add(publicKey.n);
let bn3 = bigInt(num3).mod(publicKey.n);
while (bn3.lt(0)) bn3 = bn3.add(publicKey.n);
let bn4 = bigInt(num4).mod(publicKey.n);
while (bn4.lt(0)) bn4 = bn4.add(publicKey.n);

let c = publicKey.encrypt(bn);
let c1 = publicKey.encrypt(bn1);
let c2 = publicKey.encrypt(bn2);
let c3 = publicKey.encrypt(bn3);
let c4 = publicKey.encrypt(bn4);

//console.log(c.toString());

let bid1 = publicKey.addition(c, c1);
let bid2 = publicKey.addition(c, c2);
let bid3 = publicKey.addition(c, c3);
let bid4 = publicKey.addition(c, c4);

let dec_bid1 = privateKey.decrypt(bid1);
let dec_bid2 = privateKey.decrypt(bid2);
let dec_bid3 = privateKey.decrypt(bid3);
let dec_bid4 = privateKey.decrypt(bid4);

var users = {
    usr1: {
        id: n = n + 1,
        name: "Abhinav",
        bid: bid1
    },
    usr2: {
        id: n = n + 1,
        name: "Abhishek",
        bid: bid2
    },
    usr3: {
        id: n = n + 1,
        name: "Devashish",
        bid: bid3
    },
    usr4: {
        id: n = n + 1,
        name: "Vansh",
        bid: bid4
    }
}
/*var i = 1;
while (users['usr' + i]) {
    db.bids.update({
        name: users['usr' + i].name
    }, {
        bid: users['usr' + i].bid.toString()
    });
    i++;
}*/
//console.log('Name : '+users.usr1.name+'\nBid : '+users.usr1.bid.toString());
var user1 = users;
user1.usr1.bid = dec_bid1;
user1.usr2.bid = dec_bid2;
user1.usr3.bid = dec_bid3;
user1.usr4.bid = dec_bid4;

app.set('view engine', 'ejs');
app.engine('html', ejs.renderFile);

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use('/', index);
app.use('/buyer', buyer);
app.use('/seller', seller);

app.post('/pubKeys', function (req, res) {
    if (publicKey) {
        flag = 1;
        res.send("Success");
    }
});

/*app.get('/key', function (req, res) {
    res.send(key_pub);
});*/

app.post('/bid', function (req, res) {
    if (flag == 1) {
        let bid_add = req.body.bid;
        let bnn = bigInt(bid_add).mod(publicKey.n);
        while (bnn.lt(0)) bnn = bnn.add(publicKey.n);
        let cn = publicKey.encrypt(bnn);
        let bidn = publicKey.addition(c, cn);
        let dec_bidn = privateKey.decrypt(bidn);
        n = n + 1;
        users['usr' + n] = {
            id: n,
            name: req.body.name,
            bid: bidn
        };
        user1['usr' + n] = {
            id: n,
            name: req.body.name,
            bid: dec_bidn
        };
        /*db.bids.update({
            name: users['usr' + n].name
        }, {
            bid: users['usr' + n].bid.toString()
        });*/
        console.log(user1);
        //console.log(JSON.stringify(users1));
        //console.log("Bid Placed");
        res.send("Success");
    } else {
        res.send("!!! Auction Not Started Yet !!!")
    }
    //console.log(bid_add);
});

app.get('/showBids', function (req, res) {
    //console.log('success');
    res.json(JSON.stringify(user1));
});

app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'), () => {
    console.log('Server started at ' + app.get('port'));
});
