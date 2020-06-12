import * as express from "express";
import * as fs from "fs";
import * as cors from "cors";
import * as tf from "@tensorflow/tfjs";
import * as tfcore from "@tensorflow/tfjs-node";
import * as mobilenet from "@tensorflow-models/mobilenet";
import * as bodyParser from "body-parser";

const port = process.env.PORT || 3001;
const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: "100mb" }));

app.use("/image", (req, res) => {
  console.log(req.body);
  res.json(req.body);
});

app.listen(port, () => console.log(`🚀 - running on port ${port}`));
