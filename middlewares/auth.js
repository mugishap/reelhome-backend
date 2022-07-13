require('dotenv').config()
const jwt = require('jsonwebtoken')

exports.checkForAccess = async(req, res, next) => {
    if (req.headers.authorization === undefined) return res.status(401).json({ message: "No token provided" })
    let token = req.headers.authorization.split(' ')[1]
    try {
        let result = await jwt.verify(token, process.env.TOKEN_SECRET)
        req.user = result
        res.header('Content-Type', "application/json")
        next()
    } catch (e) {
        return res.status(400).send(e)
    }
}
