const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

const app = express();
app.use(express.json());
app.use(cors(corsOptions));

const port = process.env.PORT || 4000;

//mongodb connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.g1juc.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
client.connect((err) => {
  console.log("database connected");
  const vegCollection = client.db("warehouse").collection("vegetables");

  //all
  app.get("/vegetables", async (req, res) => {
    const query = {};
    const cursor = vegCollection.find(query);
    const vegetables = await cursor.toArray();
    res.send(vegetables);
  });
  //add product
  app.post("/addProduct", async (req, res) => {
    const product = req.body;
    const result = await vegCollection.insertOne(product);
    res.send(result);
  });

  //load data according to pagination section start
  //count Product
  app.get("/productCount", async (req, res) => {
    const count = await vegCollection.estimatedDocumentCount();
    res.send({ count });
  });
  //load data by pagination
  app.get("/paginateItem", async (req, res) => {
    const pageNumber = parseInt(req.query.pageNumber);
    const itemPerPage = parseInt(req.query.itemPerPage);
    const query = {};
    const cursor = vegCollection.find(query);
    let products;
    if (pageNumber || itemPerPage) {
      products = await cursor
        .skip(pageNumber * itemPerPage)
        .limit(itemPerPage)
        .toArray();
    } else {
      products = await cursor.toArray();
    }
    res.send(products);
  });
  //load data according to pagination section finish


  //load by id
  app.get("/vegetable", async (req, res) => {
    const { id } = req.query;
    const query = { _id: ObjectId(id) };
    const vegetable = await vegCollection.findOne(query);
    res.send(vegetable);
  });
  // sell Item
  app.put("/vegetable/:id", async (req, res) => {
    const { id } = req.params;
    const { newQty } = req.body;
    const filter = { _id: ObjectId(id) };
    const options = { upsert: true };
    const updatedDoc = {
      $set: {
        qty: newQty,
      },
    };
    const vegetable = await vegCollection.updateOne(
      filter,
      updatedDoc,
      options
    );
    res.send(vegetable);
  });
});

//basic route
app.get("/", (req, res) => {
  res.send("warehouse server is running");
});

app.listen(port, () => {
  console.log(`server is running at port ${port}`);
});
