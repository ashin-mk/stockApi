const express=require('express')
const indices=require('./indices')
const app=express()
const mongoose=require('mongoose')
const axios=require('axios')
const cors=require('cors')
require('dotenv').config()
const baseUrl="https://api.stockmarketapi.in/api/v1/"
var data={}
var closed=false
const query='getprices'

//body parser middleWares
app.use(cors())
app.use(express.json())

app.listen(process.env.PORT|| 3001,(err)=>{
    !err?console.log('server is running...'):console.log('err running srever')
})
app.get('/',(req,res)=>{
  res.send('welcome to stock App!!!')
})
//db Connection
mongoose.connect(process.env.devdbUrl).then(()=>console.log('successfully connected to db')).catch((err)=>console.log(err))

//middlewares 
//app.use("/","specify router")

//function to know the market is open or not
const getMarketStaus=()=>{
    if(data?.[0]?.TodayClose){
        closed=true
        return 'closed'
    }
}

const filterData=(filterData)=>{
  console.log(typeof(filterData))
return filterData.sort(function(a,b){
  if(a.MarketCap>b.MarketData){
    return -1
  }
  if(a.MarketCap<b.MarketCap){
    return 1
  }
  return 0
})
}


app.get('/magicData',async(req,res)=>{
  try {
      response= await  axios.get(`${baseUrl}allstocks?token=${process.env._STOCK_API}`)
      data=filterData(response?.data?.data)
       res.status(200).send({data:JSON.stringify({data:data.splice(0,100),pagination:null})})
    } catch (error) {
      console.log('some unexpected error occured',error)
      res.status(400).send(error)
    }
})
app.get('/marketData',async(req,res)=>{
  try {
    const pageNo=parseInt(req?.headers?.pageno) || 1
    const recordToFetch=pageNo*10 -indices?.[req?.headers?.query]?.length
    const dataLength= recordToFetch>0?recordToFetch: 10
    const startingIndex=(pageNo-1)*10
    const data= await  axios.get(`${baseUrl}${query}?token=${process.env._STOCK_API}&nsecode=${indices?.[req?.headers?.query]?.slice(startingIndex,dataLength+startingIndex)?.join(',')}`)
    res.status(200).send({data:JSON.stringify({data:data?.data?.data,pagination:{length:Math.ceil(indices?.[req?.headers?.query]?.length/10)}})})
  } catch (error) {
    console.log(error)
    res.status(400).send('err')
  }
})