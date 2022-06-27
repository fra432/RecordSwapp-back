const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { notFoundError, generalError } = require("./middlewares/errors");
const userRouter = require("../routers/userRouter");
const usersRouter = require("../routers/usersRouter");
const recordsRouter = require("../routers/recordsRouter");
const recordRouter = require("../routers/recordRouter");

const app = express();

const corsOptions = {
  origin: [
    "http://localhost:4000",
    "http://localhost:4001",
    "http://localhost:4002",
    "http://localhost:4005",
    "https://francesco-fabrissin-front-final-project-202204-bcn.netlify.app/",
    "https://francesco-fabrissin-front-final-project-202204-bcn.netlify.app",
  ],
};

app.disable("x-powered-by");
app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.static("uploads"));
app.use(express.json());

app.use("/user", userRouter);
app.use("/users", usersRouter);
app.use("/myCollection", recordsRouter);
app.use("/records", recordRouter);

app.use(notFoundError);
app.use(generalError);

module.exports = app;
