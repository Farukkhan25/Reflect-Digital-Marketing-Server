const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;
console.log(process.env.DB_USER);

// middle wares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.qbydxwz.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});


async function run() {
  try {
    const serviceCollection = client.db('digitalMarketing').collection('services');

    app.get("/", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const allServices = await cursor.limit(3).toArray();
      res.send(allServices);
    });

    app.get("/details", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const allServices = await cursor.toArray();
      res.send(allServices);
    });

    app.get("/details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    });
  } finally {
  }
}

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
