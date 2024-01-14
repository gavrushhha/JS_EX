const express = require('express');
const mongoose = require('mongoose');
const authRouter = require('./auth/authRouter');
const productRouter = require('./product/productRouter');
const orderRouter = require('./order/orderRouter');
const redisClient = require('./redisClient');

const PORT = 4005;
const IP = "0.0.0.0";
const app = express();

app.use(express.json());

app.use((req, res, next) => {
    req.redisClient = redisClient;
    next();
  });

app.use("/auth", authRouter);
app.use("/", productRouter);
app.use("/orders", orderRouter);
const start = async () => {
    try {
        const dbURI = 'mongodb+srv://sasha:bushuev2003@cluster0.uhh4prv.mongodb.net/jsdb';
        await mongoose.connect(dbURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
        });

        app.listen(PORT, IP, () => console.log(`Server started on ${IP}:${PORT}`));
    } catch (e) {
        console.error(e);
    }
};

start();
