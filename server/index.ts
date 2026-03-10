import express from "express";
import userRoutes from "./src/routes/app.routes";
import companyRoutes from "./src/routes/app.routes";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get("/", async (req, res) => {
  res.send("Hello via Express!");
});

// register routes
app.use("/api", userRoutes)
app.use("/api", companyRoutes)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
