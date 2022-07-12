const express = require('express');
const app = express();
const PORT = process.env.PORT || 5050;
const bodyParser = require('body-parser');
const cors = require('cors');


app.use(cors())
app.use(bodyParser.json({ limit: '5mb' }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
app.use(express.urlencoded({ extended: true }))

app.listen(PORT, () => {
    console.log(`[LOG] SERVER UP ON PORT %c${PORT}`, 'color: green; font-size: 20px;');
})

dbConnection()


app.use("/user", require("./src/routes/user"))
app.use("/post", require('./src/routes/posts'))


const { Swaggiffy } = require('swaggiffy')
new Swaggiffy().setupExpress(app).swaggiffy();
