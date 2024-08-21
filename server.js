const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const colors = require("colors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const path = require("path");

//DOTENV
dotenv.config();

// MONGODB CONNECTION
connectDB();

//REST OBJECT
const app = express();

//middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

//ROUTES
app.use("/api/v1/auth", require("./routes/userRoutes"));
app.use("/api/v1/notification", require("./routes/notificationRouter"));
app.use("/api/v1/court", require("./routes/courtRoutes"));
app.use('/api/v1/entries', require("./routes/entryRoutes"));
app.use('/api/v1/points', require("./routes/pointRoutes"));
app.use('/api/v1/locations', require("./routes/locationRoutes"));
app.use('/api/v1/events', require("./routes/eventRoutes"));

//Home
// app.get("/", (req, res)=>{

//   res.status(200).send({

//     "success" : true,
//     "msg": "node server running"
    
//   })
  
// })

//PORT
const PORT = process.env.PORT || 8080;

//listen
app.listen(PORT, () => {
  console.log(`Server Runnning ${PORT}`.bgGreen.white);
});


app.use(express.static(path.join(__dirname, "./admin/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./admin/build/index.html"));
});
