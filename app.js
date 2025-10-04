require("dotenv").config();
const express = require("express");
const fsPromises = require("fs").promises;
const path = require("path");
const {
  validateUser,
  validateUserIdAndUserEmailExistence,
} = require("./validateUser");
const usersFilePath = path.join(__dirname, "users.json");

const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Home!");
});

app.get("/users", async (req, res) => {
  try {
    const data = await fsPromises.readFile(usersFilePath, "utf-8");

    const users = JSON.parse(data);
    res.json(users);
  } catch (parseError) {
    res.status(500).json({ error: "Error parsing users data" });
  }
});

app.post("/users", async (req, res) => {
  const newUser = { ...req.body, id: parseInt(req.body.id) };

  try {
    const data = await fsPromises.readFile(usersFilePath, "utf-8");
    const users = JSON.parse(data);
    const { isValid, errors } = validateUser(newUser, {
      requireId: false,
      existingUsers: users,
    });

    const { isValidIdEmail, newErrors } = validateUserIdAndUserEmailExistence(
      newUser.id,
      newUser.email,
      users
    );

    if (!isValid || !isValidIdEmail) {
      const totalErrors = [...(errors || []), ...(newErrors || [])];
      if (totalErrors.length > 0) {
        return res.status(400).json({ error: totalErrors });
      }
    }

    users.push(newUser);
    await fsPromises.writeFile(usersFilePath, JSON.stringify(users, null, 2));
    res.status(201).json({
      message: "User added successfully",
      user: newUser,
    });
  } catch (readError) {
    return res.status(500).json({ error: "Error reading users data" });
  }
});

app.put("/users/:id", async (req, res) => {
  try {
    const data = await fsPromises.readFile(usersFilePath, "utf-8");
    const id = parseInt(req.params.id, 10);
    const users = JSON.parse(data);
    const updatedUser = req.body;

    const { isValid, errors } = validateUser(updatedUser, {
      requireId: true,
      existingUsers: updatedUser,
    });

    if (!isValid) {
      return res.status(400).json({ error: errors });
    }
    if (!users.some((user) => user.id === id)) {
      return res.status(404).json({ error: "User not found" });
    } else {
      const dataUpdated = users.map((user) => {
        if (user.id === id) {
          console.log(user);
          return { ...user, ...updatedUser };
        }
        return user;
      });
      await fsPromises.writeFile(
        usersFilePath,
        JSON.stringify(dataUpdated, null, 2)
      );
      res.json({ message: "User updated successfully", user: updatedUser });
    }
  } catch (error) {
    return res.status(500).json({ error: "Error reading users data" });
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    const data = await fsPromises.readFile(usersFilePath, "utf-8");
    const id = parseInt(req.params.id, 10);
    const users = JSON.parse(data);
    const user = users.filter((user) => user.id === id);
    if (user.length === 0) {
      return res.status(404).json({ error: "User not found" });
    } else {
      const usersFiltered = users.filter((user) => user.id !== id);
      fsPromises.writeFile(
        usersFilePath,
        JSON.stringify(usersFiltered, null, 2)
      );
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Error reading users data" });
  }
});

app.listen(PORT, () => {
  console.log("Environment Variables:", process.env.PORT);
  console.log(`Server is running on http://localhost:${PORT}`);
});
