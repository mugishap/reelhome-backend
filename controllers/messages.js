const { messageSchema } = require("../models/messages");

exports.getMessages = async (req, res) => {
    try {
        const messages = await messageSchema.find();
        return res.json(messages);
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};

exports.getMessage = async (req, res) => {
    try {
        const message = await messageSchema.findById(req.params.id);
        return res.json(message);
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};

exports.createMessage = async (req, res) => {
    const { text, room, room1, author, time } = req.body;
    const newMessage = new Message({
        text,
        room,
        room1,
        author,
        time,
    });
    try {
        await newMessage.save();
        return res.status(201).json(newMessage);
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};

exports.updateMessage = async (req, res) => {
    try {
        const updatedMessage = await messageSchema.updateOne(
            { _id: req.params.id },
            { $set: req.body }
        );
        return res.json(updatedMessage);
    } catch (err) {
        return res.json({ message: err });
    }
};

exports.deleteMessage = async (req, res) => {
    try {
        const deletedMessage = await messageSchema.deleteOne({ _id: req.params.id });
        return res.json(deletedMessage);
    } catch (err) {
        return res.json({ message: err });
    }
};

exports.getMessageByRoom = async (req, res) => {
    try {
        const messages = await messageSchema.find(
            { room: req.params.room } || { room1: req.params.room }
        );
        return res.status(200).send(messages);
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};

exports.getMessageByRoom1 = async (req, res) => {
    try {
        const messages = await messageSchema.find(
            { room: req.params.room } || { room1: req.params.room }
        );
        return res.status(200).send(messages);
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};
