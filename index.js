const express = require('express')
const cors = require('cors')
const app = express();
const port = process.env.PORT || 5000;

// .env file access
require('dotenv').config();

// jwt intialize 
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')




// middleware

app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())




// mongodb functionality start 



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@atlascluster.ynftepn.mongodb.net/?retryWrites=true&w=majority`;



// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


// middleware verify token

let verifyToken = async (req, res, next) => {
    let token = req.cookies?.token;
    if (!token) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {

        // error
        if (err) {
            return res.status(401).send({ message: 'unauthorized access' })
        }

        // success
        req.user = decoded;
        next();

    })
}

async function run() {
    try {

        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        const jobsCollection = client.db('JobsDB').collection('Jobs');

        const appliedJobsCollection = client.db('appliedJobDB').collection('appliedJob');



        // jwt token related api

        app.post('/jwt', verifyToken ,  async (req, res) => {

            const user = req.body;
            console.log('nadim');
            const token = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: '12h' })
            res
                .cookie('token', token, {

                    httpOnly: true,
                    secure: false
                })
                .send({ success: true });
        })


        // get api 
        app.get('/jobs', async (req, res) => {

            console.log(req.query.email);

            let query = {};

            if (req.query?.email) {
                query = { email: req.query.email }
            }

            const result = await jobsCollection.find(query).toArray();
            res.send(result);
        })

      



        // [GeT Method according to Category]

        app.get('/jobs/:category', async (req, res) => {

            const category = req.params.category;
            const query = { category: category };
            const result = await jobsCollection.find(query).toArray();
            res.send(result);


        })

        // [GeT Method according to id and category]

        app.get('/jobs/:category/:id', async (req, res) => {

            const id = req.params.id;
            const category = req.params.category;
            const query = { _id: new ObjectId(id), category: category }
            const result = await jobsCollection.findOne(query);
            res.send(result)


        })



        // delete 
        app.delete('/jobs/:id', async (req, res) => {

            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await jobsCollection.deleteOne(query);
            res.send(result);

        })

        // [post method]

        app.post('/jobs', async (req, res) => {

            const newJob = req.body;
            console.log(newJob);

            const result = await jobsCollection.insertOne(newJob);
            res.send(result);

        })

        // [put and update method]

        app.put('/jobs/:id', async (req, res) => {

            const id = req.params.id;
            // const category = req.params.category;
            const filter = { _id: new ObjectId(id) }
            const optinons = { upsert: true }
            const updateJob = req.body;
            const food = {
                $set: {

                    email: updateJob.email,
                    PostedBy: updateJob.PostedBy,
                    category: updateJob.category,
                    JobTitle: updateJob.JobTitle,
                    SalaryRange: updateJob.SalaryRange,
                    ApplicantsNumber: updateJob.ApplicantsNumber,
                    PostingDate: updateJob.PostingDate,
                    ApplicationDeadline: updateJob.ApplicationDeadline,
                    ImageURL: updateJob.ImageURL,

                }
            }

            const result = await jobsCollection.updateOne(filter, food, optinons);
            res.send(result)

        })



        // My jobs cart added

        // [Get method for cart]

        app.get('/appliedJob', async (req, res) => {

            console.log(req.query.gmail);

            let query = {};

            if (req.query?.gmail) {
                query = { gmail: req.query.gmail }
            }


            const cursor = appliedJobsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);


        })

        // // single Data show method [GET METHOD SINGLE DATA]

        app.get('/appliedJob/:id', async (req, res) => {

            const id = req.params.id;
            console.log(id)

            const query = { _id: new ObjectId(id) }
            const result = await appliedJobsCollection.findOne(query);
            res.send(result)

        })



        // [post method for cart]

        app.post('/appliedJob', async (req, res) => {

            const newJob = req.body;
            console.log(newJob);
            const result = await appliedJobsCollection.insertOne(newJob);
            res.send(result);

        })


        // [Delete method from cart]

        app.delete('/appliedJob/:id', async (req, res) => {

            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await appliedJobsCollection.deleteOne(query);
            res.send(result);

        })


    } finally {

    }
}
run().catch(console.dir);




// mongodb functionality end



app.get('/', (req, res) => {
    res.send('Alhamdullah all info is get')
})

app.listen(port, (req, res) => {
    console.log(`Port is runnning : ${port}`)
})