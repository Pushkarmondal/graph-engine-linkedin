import express from "express";
import userRoutes from "./src/routes/app.routes";
import companyRoutes from "./src/routes/app.routes";
import skillRoutes from "./src/routes/app.routes";
import attachCompanyToUser from "./src/routes/app.routes";
import attachSkillsToUser from "./src/routes/app.routes";
import connectUsers from "./src/routes/app.routes";
import getMutualConnections from "./src/routes/app.routes";
import getRecommendations from "./src/routes/app.routes";
import getShortestPath from "./src/routes/app.routes";
import getNetworkDepth from "./src/routes/app.routes";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get("/", async (req, res) => {
  res.send("Hello via Express!");
});

// register routes
app.use("/api", userRoutes)
app.use("/api", companyRoutes)
app.use("/api", skillRoutes)
app.use("/api", attachCompanyToUser)
app.use("/api", attachSkillsToUser)
app.use("/api", connectUsers)
app.use("/api", getMutualConnections)
app.use("/api", getRecommendations)
app.use("/api", getShortestPath)
app.use("/api", getNetworkDepth)


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
