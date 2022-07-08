const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());


const port = process.env.PORT || 4000;

//mongodb connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.g1juc.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
    console.log('database connected')
    const vegCollection = client.db("warehouse").collection("vegetables");

    //all
    app.get('/vegetables',async(req, res)=>{
        const query = {};
        const cursor = vegCollection.find(query);
        const vegetables = await cursor.toArray();
        res.send(vegetables);
    })
    //load by id
    app.get('/vegetable',async(req, res)=>{
        const {id} = req.query;
        const query = { _id: ObjectId(id) }
        const vegetable = await vegCollection.findOne(query);
        res.send(vegetable);
    })
});


//basic route
app.get('/',(req, res)=>{
    res.send('warehouse server is running');
})


app.listen(port,()=>{
    console.log(`server is running at port ${port}`);
})