const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(
  "sk_test_51NFaHHHYxG7WJPCTo6DyF8n9Ty7LHso58T2LKEWbMN1RnwDs6Vdb8c1AIEk6ywGP4JAayNmD8PMlNtmwQBIsvcjK00SvyfXze0"
);
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

//middle wear
app.use(cors());
app.use(express.json());

const user = process.env.MONGO_USER;
const pass = process.env.MONGO_PASS;
const uri = `mongodb+srv://${user}:${pass}@cluster0.oqkryfl.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});



async function run() {
  try {
    await client.connect();

    const manuCollaction = client.db("forestLounge").collection("manuData");
    const orderCollaction = client.db("forestLounge").collection("orders");
    const  userCollaction = client.db("forestLounge").collection("users");




  app.post("/create-payment-intent", async (req, res) => {
  
      const  {totalAmount} = req.body; 
      const paymentIntent = await stripe.paymentIntents.create({
        currency: "usd",
        amount:  totalAmount * 100,
        payment_method_types: ["card"],
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      })
});


  
// add to cart ordered data inject database post api 
    app.post('/orderData', async (req, res) => {
      const catchData = req.body
      const data = await orderCollaction.insertOne(catchData)
      res.send(data)
    })

//ordered all data taken get api and email wise data get
    app.get('/orderData', async (req, res) => {
      let query = {}
      if (req.query?.email) {
        query = {email: req.query.email}
      }
      const orderDatas = await orderCollaction.find(query).toArray()
      res.send(orderDatas)
    })

    
//ordered one data taken get api  
    app.get('/orderData/:id', async (req, res) => {
      const id = req.params.id 
      const filter = { _id : new ObjectId(id) }
      const result = await orderCollaction.findOne(filter)
      res.send(result)
    })

//ordered data delete api
    app.delete("/orderData/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id:  new ObjectId(id) };
      const result = await orderCollaction.deleteOne(filter);
      res.send(result);
    });





//category wise data taken get api using category name with query parameter
    app.get("/manu", async (req, res) => {
      let query = {}
      
      if (req.query?.category) {
        const queryparam = req.query.category;
         query = { category: queryparam };
       }
      
      const data = await manuCollaction.find(query).toArray();
      res.send(data);
    });

//manu uploade POST APi
    app.post('/manu', async (req, res) => {
      const data = req.body
      const result = await manuCollaction.insertOne(data)
      res.send(result)
    })













    /** *************************** user information related oparation API  ************************ */

  //user info insert in database post APi
    app.post('/user', async (req, res) => {
      const userData = req.body;
      const result = await userCollaction.insertOne(userData)
      res.send(result)
    })

// all user taken get api 
    app.get('/user', async (req, res) => {
      const result = await userCollaction.find().toArray();
      res.send(result)
    })


//one user taken get api 
    app.get('/user/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await userCollaction.findOne(query)
      res.send(result)
    })


//user info update patch api
    app.patch('/user/:id', async (req, res) => {
      const id = req.params.id
      const data = req.body
      const query = { _id: new ObjectId(id) }
      const updateData = {
        $set: {
          role: data.role
        }
      }
      const result = await userCollaction.updateOne(query, updateData)
      res.send(result)
    })
    
  } finally {

  }
}


run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server ready go to path for server data");
});

app.listen(port, () => {
  console.log(`your server is run on port ${port}`);
});
