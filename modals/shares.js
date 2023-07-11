const mongoose=require('mongoose')
const storeShares=mongoose.Schema({
    Date:String,
    stocks:Object
})
module.exports=mongoose.model('shares',storeShares)