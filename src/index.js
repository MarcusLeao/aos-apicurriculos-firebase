import sequelize from "./config/db";
import routes from "./routes";

const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/curriculo", routes.curriculo);

const PORT = 3000;

sequelize.sync().then(() => {
	app.listen(PORT, () => console.log(`App listening on port: ${PORT}`));
});
