import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { httpServer } from "./app.js";

dotenv.config({
  path: './.env'
});

connectDB()
.then(() => {
  httpServer.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running at port: ${process.env.PORT}`);
    console.log(`Socket.io is ready for connections`);
  });
})
.catch((err) => {
  console.log("MONGO DB connection failed!!! ", err);
});
