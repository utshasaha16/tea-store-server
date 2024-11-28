const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;

// middleWare
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iwlha.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri);
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const teaCollection = client.db("teaDB").collection("tea");

    app.get("/tea", async (req, res) => {
      const cursor = teaCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/tea/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await teaCollection.findOne(query);
      res.send(result);
    });

    app.post("/tea", async (req, res) => {
      const newTea = req.body;
      console.log(newTea);
      const result = await teaCollection.insertOne(newTea);
      res.send(result);
    });

    app.put("/tea/:id", async(req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedTea = req.body;
      const tea = {
        $set: {
          name: updatedTea.name,
          quantity: updatedTea.quantity,
          supplier: updatedTea.supplier,
          taste: updatedTea.taste,
          category: updatedTea.category,
          details: updatedTea.details,
          photoUrl: updatedTea.photoUrl,
        },
      };

      const result = await teaCollection.updateOne(filter, tea, options);
      res.send(result)

    });

    app.delete("/tea/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await teaCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("tea making server is running");
});

app.listen(port, () => {
  console.log(`tea server is running on PORT: ${port}`);
});
