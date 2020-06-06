const mongoose = require('mongoose');

const db = mongoose.connection;

db.on('error', (err) => {
    console.log('Mongodb connection error: ', err);
});

db.on('open', () => {
    console.log('Mongodb connection');
});


class DB {
    connect() {
        return mongoose.connect('mongodb+srv://Aydos:U2Wxw9lLPZ0yl3Ie@cluster0-xaahy.mongodb.net/delivery?retryWrites=true&w=majority',{
            autoIndex: false,
            useNewUrlParser: true,
            useFindAndModify: false,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        });
    }
};

module.exports = DB;