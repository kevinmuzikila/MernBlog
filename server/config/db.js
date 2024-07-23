const mongoose = require('mongoose');
const uri = 'mongodb+srv://kevinmuzikila:<password>@blogging.dnaovr9.mongodb.net/';

const connectDB = async () => {

    try {
        mongoose.set('strictQuery', false);
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Datebase Connected: ${conn.connection.host}`);
    } catch(error) {
        console.log(error);
    }
}

module.exports = connectDB;