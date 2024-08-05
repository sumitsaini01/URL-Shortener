const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const { restrictToLoggedinUserOnly, checkAuth } = require("./middleware/auth");
//DataBase
const mongoose = require("mongoose");
const { connectToMongoDB } = require("./connect");
const URL = require("./models/url");

//Routes
const urlRoute = require("./routes/url");
const staticRoute = require("./routes/staticRouter");
const userRoute = require("./routes/user");

//PORT number for server to run
const app = express();
const PORT = 8001;

//Connecting to MongoDB
connectToMongoDB("mongodb://localhost:27017/short-url").then(() =>
  console.log("MongoDB is connected...")
);

//Defining view engine(ejs) for SSR(server side rendering)
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

//Middlewares(for accepting json and form data)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//request urls(possible routes)
app.use("/url", restrictToLoggedinUserOnly, urlRoute);
app.use("/user", userRoute);
app.use("/", checkAuth, staticRoute);

app.get("/url/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  const entry = await URL.findOneAndUpdate(
    {
      shortID: shortId,
    },
    {
      $push: {
        visitHistory: { timestamp: Date.now() },
      },
    }
  );
  res.redirect(entry.redirectURL);
});

//Starting Server
app.listen(PORT, () => console.log(`Server Started at PORT: ${PORT}`));
