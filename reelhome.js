const express = require('express');
const app = express();
const PORT = process.env.PORT || 5050;
const bodyParser = require('body-parser');
const cors = require('cors');
const {dbConnection} = require('./utils/mongo');

const frontendURL = 'http://localhost:3000/'
// const frontendURL = 'https://reelhome.vercel.app/
app.use(cors({origin:`${frontendURL}`}));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
app.use(express.urlencoded({ extended: true }))

app.listen(PORT, () => {
    console.log(`%c[LOG] SERVER UP ON PORT ${PORT}`, 'color: green; font-size: 20px;');
})

dbConnection()


app.use("/user", require("./routes/user"))
app.use("/post", require('./routes/posts'))


// const { Swaggiffy } = require('swaggiffy')
// new Swaggiffy().setupExpress(app).swaggiffy();
