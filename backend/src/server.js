require("dotenv").config();

const express = require("express");
const cors = require("cors");

const {connectDB, pool} = require("./configs/database");

const authRoute = require("./routes/authRoute");
const shipperRoute = require("./routes/shipperRoute");
const businessesRoute = require("./routes/businessesRoute");
const dishRoute = require("./routes/dishRoute");
const categoryRoute = require("./routes/categoryRoute");
const bookingRoute = require("./routes/bookingRoute");



const app = express();

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

app.use(express.json());

//Routes
app.use("/v1/authRoute", authRoute);

app.use("/v1/shipperRoute", shipperRoute);

app.use("/v1/businessesRoute", businessesRoute);

app.use("/v1/dishRoute", dishRoute);

app.use("/v1/categoryRoute", categoryRoute);

app.use("/v1/bookingRoute", bookingRoute);




connectDB();
const PORT = process.env.SER_PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});