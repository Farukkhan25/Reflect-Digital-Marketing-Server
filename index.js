const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
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

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    const serviceCollection = client.db('digitalMarketing').collection('services');
    const reviewCollection = client.db('digitalMarketing').collection('reviews');

    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ token });
    }); 

    app.get("/", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const allServices = await cursor.limit(3).toArray();
      res.send(allServices);
    });

    // Get all Services
    app.get("/details", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const allServices = await cursor.toArray();
      res.send(allServices);
    });

    // Get individual Service details
    app.get("/details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    });

    // post new service
    app.post('/details', async (req, res) => {
            const service = req.body;
            console.log(service);
            const result = await serviceCollection.insertOne(service)
            res.send(result);
        });

    app.get("/review/:id", async (req, res) => {
      const id = req.params.id;
      const query = { id: ObjectId(id) };
      const review = await reviewCollection.findOne(query);
      res.send(review);
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
