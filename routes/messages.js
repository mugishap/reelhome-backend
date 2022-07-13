const express = require("express");
const messageRouter = express.Router();
const messageSchema = require("../models/messages");
const { registerDefinition } = require("swaggiffy");
const { createMessage, getMessages, updateMessage, deleteMessage, getMessageByRoom, } = require("../controllers/messages");
const {checkForAccess} = require("../middlewares/auth");

messageRouter.get("/", checkForAccess, getMessages);
messageRouter.post("/newMessage", checkForAccess, createMessage);
messageRouter.put("/:id", checkForAccess, updateMessage);
messageRouter.delete("/:id", checkForAccess, deleteMessage);
messageRouter.get("/room/:room", checkForAccess, getMessageByRoom);

registerDefinition(messageRouter, {
    tags: "Messages",
    mappedSchema: "messageSchema",
    basePath: "/messages",
});

module.exports = messageRouter;

