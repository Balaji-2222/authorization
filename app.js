const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
app.use(express.json());
let db = null;
const path = require("path");
const dbPath = path.join(__dirname, "userData.db");
const dbServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running");
    });
  } catch (e) {
    console.log(`Error is : ${e.message}`);
    process.exit(1);
  }
};
dbServer();
app.post("/register/", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const query = `SELECT * FROM user
    WHERE username = '${username}'`;
  const r = await db.get(query);
  if (r === undefined) {
    const doubt = password;

    if (doubt.length >= 5) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const query = `INSERT INTO user VALUES
        ('${username}', '${name}', '${hashedPassword}',
        '${gender}', '${location}')`;
      const a = await db.run(query);
      response.send("User created successfully");
    } else {
      response.status(400);
      response.send("Password is too short");
    }
  } else {
    response.status(400);
    response.send("User already exists");
  }
});
app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const query = `SELECT * FROM user
    WHERE username= '${username}'`;
  const ans = await db.get(query);
  response.send(ans);
  if (ans === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const isPasswordMatched = await bcrypt.compare(password, ans.password);
    if (isPasswordMatched === true) {
      response.send("Login success!");
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
});
module.exports = app;
