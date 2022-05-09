const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { response } = require("express");
const jwt = require('jsonwebtoken');
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kbjxh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const itemCollection = client.db("furnioData").collection("item");

   // user login Jwt post api 
   app.post('/login', async (req, res)=>{
    const email = req.body;
    const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET);
    res.send({token})
  })

  //verify token
  function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
    console.log('inside verifyJWT',authHeader)
    next();
   }

   // item api
    app.get("/item", async (req, res) => {
      const query = {};
      const cursor = itemCollection.find(query);
      const items = await cursor.toArray();
      res.send(items);
    });

    app.get('/item/:id',async(req, res)=>{
        const id = req.params.id;
        const query={_id: ObjectId(id)};
        const item = await itemCollection.findOne(query);
        res.send(item);
    })

    
     app.get('/myItems', verifyJWT, async (req, res)=>{
      //  const authHeader = req.headers.authorization;
      //  console.log(authHeader)
       const email = req.query.email;
       console.log(email)
       const query = {email};
       const cursor = itemCollection.find(query);
       const myItems = await cursor.toArray();
       res.send(myItems);
     })

    //post api
    app.post('/item', async(req, res)=>{
      const newItem = req.body;
      const tokenInfo = req.headers.authorization;
      console.log(tokenInfo)
      const result = await itemCollection.insertOne(newItem);
      res.send(result);
    });


    //Delete Api
    app.delete('/item/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const result = await itemCollection.deleteOne(query);
      res.send(result);
    })

    //Delete MyItem api
    app.delete('/myItems/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const result = await itemCollection.deleteOne(query);
      res.send(result);
    })


    // Update quantity api
    app.put('/quantity/:id', async (req, res) =>{
      const id = req.params.id;
      const data = req.body;
      const filter = {_id: ObjectId(id)}
      const options = {upsert: true};
      const updateDoc = {
        $set: {
          quantity : data.quantity
        }
      };
      const result = await itemCollection.updateOne(filter,updateDoc,options)
      res.send(result);
    })

    // Jwt post api
    // app.post('/login', async (req, res)=>{
    //   const email = req.body;
    //   const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET);
    //   res.send({token})
    // })

  } finally {

  }
}

//verify token
// function verifyToken(token){
//   let email;
//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
//     if(err){
//       email = "Invalid Email"
//     }
//     if (decoded){
//       console.log(decoded)
//       email = decoded
//     }
//   })
//   return email ;
// }

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("running my server");
});

app.listen(port, () => {
  console.log("Listening to port", port);
});