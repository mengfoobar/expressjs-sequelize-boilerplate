const express = require('express');
const bodyParser = require('body-parser');
const db = require('./models');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3000;

app.use(bodyParser.json());
// Function to clear the database
const clearDatabase = async () => {
  await db.sequelize.sync({force: true}); // This clears the database
  console.log('Database cleared and re-synced.');
};

// Define startServer as a separate function
function startServer() {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

// Check for the '--clear' flag
if (process.argv.includes('--clear')) {
  clearDatabase().then(() => {
    console.log('Starting server after clearing database...');
    startServer();
  });
} else {
  db.sequelize.sync().then(() => {
    console.log("Synced db without clearing.");
    startServer();
  });
}

// Create a new student with generated ID
app.post('/students', async (req, res) => {
  try {
    const id = uuidv4(); // Generate a unique ID
    const studentData = {...req.body, id}; // Add the generated ID to the student data
    const student = await db.students.create(studentData);
    res.json(student);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all students
app.get('/students', async (req, res) => {
  try {
    const students = await db.students.findAll();
    res.json(students);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get a student by id
app.get('/students/:id', async (req, res) => {
  try {
    const student = await db.students.findByPk(req.params.id);
    if (student) {
      res.json(student);
    } else {
      res.status(404).send("Student not found");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

// Update a student's info
app.put('/students/:id', async (req, res) => {
  try {
    const student = await db.students.findByPk(req.params.id);
    if (student) {
      await student.update(req.body);
      res.json(student);
    } else {
      res.status(404).send("Student not found");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete a student
app.delete('/students/:id', async (req, res) => {
  try {
    const deleted = await db.students.destroy({
      where: {id: req.params.id}
    });
    if (deleted) {
      res.send("Student deleted");
    } else {
      res.status(404).send("Student not found");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});