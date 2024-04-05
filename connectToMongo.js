const mongoose = require('mongoose');
const connectToMongo = async()=>{
try {
  mongoose.connect('mongodb+srv://pxyz943:wJY9mtvHp2rvZ7We@week3.qssgcap.mongodb.net/srm', 
).then(()=>{
    console.log('connected to mongo')
});
} catch (error) {
  console.log(error.message)
}
}
module.exports = connectToMongo