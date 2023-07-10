const express = require('express')
const app = express()
const port = 3003
const fs= require('fs');
const path= require("path");
const bodyParser= require('body-parser');
const { error } = require('console');
const { purge } = require('../Week2/Assignment/todoServer');
// const cors=require("cors"); //allows the backend to get request from anywhere
app.use(bodyParser.json());
// app.use(cors());

const { MongoClient }= require('mongodb');
const url='mongodb+srv://Vipul:Vipul123@cluster0.vth9opv.mongodb.net/';
const client= new MongoClient(url);

client.connect((err)=>{
  if(err){
    console.error('Failed to connect to MongoDB:',err);
    return;
  }
  console.log('Connected to MongoDB');
})

function findIndex(arr, courseID) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].courseID === courseID) return i;
  }
  return -1;
}

app.get('/', (req, res) => {
  res.send('Course website is running!')
})

//ADMIN ROUTES//
app.post('/admin/signup', async (req,res)=>{
  const newAdmin=req.body;
  try {
    const collection = client.db('courseWebsite').collection('admins');
    const admins = await collection.insertOne(newAdmin);

    res.status(200).send('Signed Up as Admin successfully');
  } catch (err) {
    res.status(500).send('Failed to sign up!');
  }
})

app.post('/admin/login', async(req,res)=>{
  const login= req.headers;

  try {
    const collection = client.db('courseWebsite').collection('admins');
    const admins = await collection.find({}).toArray();
    isLoggedIn= false;
    admins.forEach((admin) => {
      if (admin.username === login.username && admin.password === login.password) {
        isLoggedIn = true;
      }
    });

    if (isLoggedIn) {
      res.send('Logged in successfully!');
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (err) {
    res.status(500).send('Failed to read data');
  }
})

app.post('/admin/courses', async(req,res)=>{
  const admin= req.header;
  const newCourse={
    courseID: Math.floor(Math.random()*1000), 
    ...req.body,
  }
  try {
    const collection = client.db('courseWebsite').collection('courses');
    const courses = await collection.insertOne(newCourse);

    res.status(200).send(newCourse);
  } catch (err) {
    res.status(500).send('Failed to insert data');
  }
})

app.put('/admin/courses/:courseID', async(req,res)=>{
  const courseID = parseInt(req.params.courseID);
  const updateCourse = req.body;

  try {
    const collection = client.db('courseWebsite').collection('courses');

    const filter = { courseID: courseID };
    const course = await collection.findOne(filter);

    if (!course) {
      res.status(404).send('Course not found');
      return;
    }

    // Update the document with the new data
    const updatedCourse = { ...course , ...updateCourse };

    // Save the changes to MongoDB
    const result = await collection.updateOne(filter, { $set: updatedCourse });

    res.status(200).send('Course updated successfully');
  } catch (err) {
    res.status(500).send('Failed to update course');
  }
})

app.get('/admin/courses', async(req,res)=>{
  try{
    const collection= client.db('courseWebsite').collection('courses');
    const courses = await collection.find({}).toArray();
    res.status(200).json(courses)
  }catch(err){
    res.status(500).send('Failed to fetch courses!')
  }
})

//USER ROUTES
app.post('/users/signup', async(req,res)=>{
  const newUser=req.body;
  try{
    const collection = client.db('courseWebsite').collection('users');
    const result = await collection.insertOne(newUser);

    res.status(200).send('Signed Up successfully!')
  }catch(err){
    res.status(500).send('Failed to sign up!')
  }
})

app.post('/users/login', async(req,res)=>{
  const login= req.headers;
  
    const collection= client.db('courseWebsite').collection('users');
    const users= await collection.find({}).toArray();
    isLoggedIn= false;
    users.forEach((user)=>{
      if(user.username==login.username && user.password== login.password)
        isLoggedIn=true;
    })
    if(isLoggedIn){
      res.send('Logged in Successfully!')
    }else{
      res.status(401).send('Invalid Credentials')
    }

})

app.get('/users/courses', async(req,res)=>{
  const collection= client.db('courseWebsite').collection('courses')
  const courses= await collection.find({}).toArray();
  res.status(200).json(courses);
})

app.post('/users/courses/:courseID', async(req,res)=>{
  const courseID= parseInt(req.params.courseID);
  const collection= client.db('courseWebsite').collection('courses');
  
  const filter = { courseID: courseID };
  const course = await collection.findOne(filter);

  if(!course){
    res.status(404).send('Course not found');
    return;
  }
  const purchased= client.db('courseWebsite').collection('purchasedCourses');
  const purchasedCourse= await purchased.insertOne(course);
  res.status(200).send('Course purchased successfully!')
})

app.get('/users/purchasedCourses', async(req,res)=>{
  const collection= client.db('courseWebsite').collection('purchasedCourses');
  const purchasedCourses= await collection.find({}).toArray();

  res.status(200).json(purchasedCourses);
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
