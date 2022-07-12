const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()

const URL = process.env.ONLINE_URL
// const URL = process.env.OFFLINE_URL

const dbConnection = async () => {
    try {
        await mongoose.connect(URL, {
            useUnifiedTopology: true,
            useNewUrlParser: true
        }, (err, db) => {
            if (err) console.log("Error occured" + "\n\n" + err);
            console.log("Connected to database successfully");
        })
    } catch (error) {
        console.log(`[LOG]Error: ${error}`);

    }
}
module.exports.dbConnection = dbConnection;
