const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const cors= require('cors')
const app = express()
const port =  process.env.PORT || 5000
require('dotenv').config()




// middileware
app.use(cors())
app.use(express.json())





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9ofe0jv.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();


    const userCollection = client.db("SocialVistaDB").collection("users")
    const PostsCollection = client.db("SocialVistaDB").collection("posts")





// for paigination


// posts collection

// ...

const postsPerPage = 5;

app.get('/posts', async (req, res) => {
  let query = {};
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * postsPerPage;

  if (req.query?.tag) {
    query.tag = req.query.tag;
  }

  if (req.query?.email) {
    query.email = req.query.email;
  }

  const cursor = PostsCollection.find(query).skip(skip).limit(postsPerPage);
  const result = await cursor.toArray();
  res.send(result);
});

app.get('/postscount', async (req, res) => {
  const count = await PostsCollection.estimatedDocumentCount();
  res.send({ count });
});






















// posts collection

app.post('/posts', async (req, res) => {
  const user = req.body;
  const result = await PostsCollection.insertOne(user);
  res.send(result)

})


app.get('/posts/:id', async (req, res) => {
  const id = req.params.id
  const query = { _id: new ObjectId(id) }
  const result = await PostsCollection.findOne(query)
  res.send(result)
})

app.delete('/posts/:id', async (req, res) => {
  const id = req.params.id
  const query = { _id: new ObjectId(id) }
  const result = await PostsCollection.deleteOne(query)
  res.send(result)
})



// app.get('/posts', async (req, res) => {

//   let query = {};

//   if (req.query?.tag) {
//     query.tag = req.query.tag;
//   }

//   if (req.query?.email) {
//     query.email = req.query.email;
//   }

//   const cursor = PostsCollection.find(query);
//   const result = await cursor.toArray();
//   res.send(result);
// });



    app.post('/users', async (req, res) => {
      const user = req.body;

      // inser email if user dosent exist
      const query = { email: user.email }
      const existingUser = await userCollection.findOne(query)
      if (existingUser) {
        return res.send({ message: 'user already exists', insertedId: null })
      }
      const result = await userCollection.insertOne(user);
      res.send(result)

    })
   

    app.get('/users', async (req, res) => {
      // console.log(req.headers);
     let query = {};

        if (req.query?.email) {
            query = { email: req.query.email };
        }
        const cursor = userCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
    })









    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);






app.get('/', (req, res) => {
  res.send('Hello crazy people!')
})

app.listen(port, () => {
  console.log(`server running on port ${port}`)
})