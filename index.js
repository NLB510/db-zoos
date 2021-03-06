const express = require("express");
const helmet = require("helmet");
const knex = require("knex");

const knexConfig = {
  client: "sqlite3",
  connection: {
    filename: "./data/lambda.sqlite3"
  },
  useNullAsDefault: true
};

const db = knex(knexConfig);

const server = express();

server.use(express.json());
server.use(helmet());

// endpoints here

server.get("/", (req, res) => {
  res.send(`<h1>API IS WORKING</h1>`);
});

// GET
server.get("/api/zoos", (req, res) => {
  db("zoos")
    .then(names => {
      res.status(200).json(names);
    })
    .catch(error => {
      res.status(500).json({
        error: "Could not retrieve the data."
      });
    });
});

server.get("/api/zoos/:id", (req, res) => {
  const id = req.params.id;
  db("zoos")
    .where({ id: id })
    .first()
    .then(name => {
      if (!name) {
        return res.status(404).json({
          errorMessage: "The zoo with the specified ID does not exist"
        });
      } else {
        res.status(200).json(name);
      }
    })
    .catch(err => {
      res.status(500).json({
        message: "The was an error retrieving the data"
      });
    });
});

// POST

server.post("/api/zoos", (req, res) => {
  const zoo = req.body;

  if (!zoo.name) {
    return res.status(400).json({
      errorMessage: "Please add a name to the post."
    });
  }

  db.insert(zoo)
    .into("zoos")
    .then(ids => {
      db("zoos")
        .where({ id: ids[0] })
        .first()
        .then(zoo => {
          return res.status(201).json(zoo);
        })
        .catch(err => {
          res.status(500).json({
            error: "There was an error making your post"
          });
        });
    })
    .catch(error => {
      res.status(500).json({ error: "There was an error making your request" });
    });
});

// PUT
server.put("/api/zoos/:id", (req, res) => {
  const changes = req.body;
  const { id } = req.params;

  if (!changes.name) {
    return res.status(400).json({ errorMessage: "Please add a name." });
  }

  db("zoos")
    .where({ id: id })
    .update(changes)
    .then(count => {
      if (count === 0) {
        return res.status(404).json({
          errorMessage: "The post with the specified ID could not be found"
        });
      } else {
        res.status(200).json(count);
      }
    })
    .catch(err => {
      res.status(500).json({
        error: "There was an error with your request."
      });
    });
});

// DELETE

server.delete('/api/zoos/:id', (req, res) => {
  const {id} = req.params;

  db('zoos')
  .where({id})
  .del()
  .then(count => {
    console.log(count)
    if (count === 0) {
      return res.status(404).json({message: 'The item with the specified ID does not exist.'})
    } else {
      res.status(200).json({message: 'The data has been removed.'})
    }
  })
  .catch(err => {
    res.status(500).json({
      error: 'There was an error removing the data.'
    })
  })

})


const port = 3300;
server.listen(port, function() {
  console.log(`\n=== Web API Listening on http://localhost:${port} ===\n`);
});
