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
    const commentsCollection = client.db("SocialVistaDB").collection("comments")
    const TagsCollection = client.db("SocialVistaDB").collection("Tags")




// for paigination


// posts collection

// ...


app.get('/postscount', async (req, res) => {
  const count = await PostsCollection.estimatedDocumentCount();
  res.send({ count });
});



// tags collection
app.post('/tags', async (req, res) => {
  const user = req.body;
  const result = await TagsCollection.insertOne(user);
  res.send(result)

})

app.get('/tags', async (req, res) => {

  const cursor = TagsCollection.find();
  const result = await cursor.toArray();
  res.send(result);
})










// comment post

app.post('/comments', async (req, res) => {
  const user = req.body;
  const result = await commentsCollection.insertOne(user);
  res.send(result)

})

app.get('/comments', async (req, res) => {

    const cursor = commentsCollection.find();
    const result = await cursor.toArray();
    res.send(result);
})

app.get('/comments/:id', async (req, res) => {
  const id = req.params.id
  const query = { _id: new ObjectId(id) }
  const result = await commentsCollection.findOne(query)
  res.send(result)
})

// ...


app.get('/comments/post/:postId', async (req, res) => {
  const postId = req.params.postId;
  const query = { postId: postId };
  const cursor = commentsCollection.find(query);
  const result = await cursor.toArray();
  res.send(result);
});

// ...






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

  const cursor = PostsCollection.find(query).skip(skip).limit(postsPerPage).sort({ timestamp: -1 });
  const result = await cursor.toArray();
  res.send(result);
});



app.patch('/posts/:id/vote', async (req, res) => {
  const id = req.params.id;
  const { type } = req.body; 

  const query = { _id: new ObjectId(id) };
  const post = await PostsCollection.findOne(query);

  if (!post) {
    return res.status(404).send({ message: 'Post not found' });
  }
  if (type === 'upvote') {
    post.upvote = String(parseInt(post.upvote) + 1);
  } else if (type === 'downvote') {
    post.downvote = String(parseInt(post.downvote) - 1);
  }

  const result = await PostsCollection.updateOne(query, { $set: post });

  res.send(result);
});
// ...

app.get('/posts/recent', async (req, res) => {
  const cursor = PostsCollection.find().sort({ createdAt: -1 }).limit(3);
  const result = await cursor.toArray();
  res.send(result);
});

// ...









// users
    app.post('/users', async (req, res) => {
      const user = req.body;

      const query = { email: user.email }
      const existingUser = await userCollection.findOne(query)
      if (existingUser) {
        return res.send({ message: 'user already exists', insertedId: null })
      }
      const result = await userCollection.insertOne(user);
      res.send(result)

    })
   

    app.get('/users', async (req, res) => {

     let query = {};

        if (req.query?.email) {
            query = { email: req.query.email };
        }
        const cursor = userCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
    })








    app.get('/admin-stats', async (req, res) => {
      const users = await userCollection.estimatedDocumentCount()
      const posts = await PostsCollection.estimatedDocumentCount()
      const comments = await commentsCollection.estimatedDocumentCount()

    


      res.send({
        users,
        posts,
        comments,
      })
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