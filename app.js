require("dotenv").config();
const express = require("express");
const { PrismaClient } = require("./generated/prisma");
const prisma = new PrismaClient();

const loggerMiddleware = require("./src/middlewares/logger");
const errorHandlerMiddleware = require("./src/middlewares/errorHandler");
const fsPromises = require("fs").promises;
const path = require("path");
const {
  validateUser,
  validateUserIdAndUserEmailExistence,
} = require("./validateUser");
const authenticateToken = require("./src/middlewares/auth");
const usersFilePath = path.join(__dirname, "users.json");
const bcrypt = require("bcryptjs");
const jsonwebtoken = require("jsonwebtoken");
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(loggerMiddleware);
app.use(errorHandlerMiddleware);

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

app.get("/error", (req, res, next) => {
  next(new Error("This is a test error"));
});
app.get("/db-users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error fetching users from database" });
  }
});

app.get("/protected-route", authenticateToken, (req, res) => {
  res.json({ message: "This is a protected route" });
});

app.post("/register", async (req, res) => {
  const { email, password, name } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: "USER",
    },
  });
  res.status(201).json({ message: "User registered successfully" });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user)
    return res.status(400).json({ error: "Invalid email or password" });

  const validatePassword = await bcrypt.compare(password, user.password);
  if (!validatePassword)
    return res.status(400).json({ error: "Invalid email or password" });

  const token = jsonwebtoken.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  res.json({ token }); // Return the token to the client
});

app.listen(PORT, () => {
  console.log("Environment Variables:", process.env.PORT);
  console.log(`Server is running on http://localhost:${PORT}`);
});
