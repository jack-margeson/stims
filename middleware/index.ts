import express from 'express';
import bcrypt from 'bcrypt';
import type { Request, Response } from 'express';
import { Client } from 'pg';
import swaggerUi from 'swagger-ui-express';

// Create a new express application instance
const app = express();

// Set the network port
const port = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Enable CORS
const cors = require('cors');
app.use(
  cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  })
);

// Import the swagger JSON and display it on the /docs route
const swaggerDocument = require('./swagger.json');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Database connection details
const client = new Client({
  user: process.env.DB_USER || 'stims_admin',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'stims_db',
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

client
  .connect()
  .then(() => console.log('Connected to the PostgreSQL database'))
  .catch((err) => console.error('Connection error', err.stack));

// #########
// Endpoints
// #########

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'STIMS API middleware online.' });
});

// Get user by ID or username
app.get('/user', async (req: Request, res: Response): Promise<any> => {
  const { id, username } = req.query;

  try {
    let query = 'SELECT * FROM users WHERE ';
    let queryParams: (string | number)[] = [];

    if (id) {
      query += 'user_id = $1';
      queryParams.push(Number(id));
    } else if (username) {
      query += 'username = $1';
      queryParams.push(String(username));
    } else {
      return res
        .status(400)
        .json({ error: 'Please provide either user ID or username.' });
    }

    const result = await client.query(query, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching user.', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Register a new user
app.post('/register', async (req: Request, res: Response): Promise<any> => {
  if (req.body === undefined) {
    return res.status(400).json({ error: 'Please provide a request body.' });
  }

  const { username, first_name, last_name, email, password } = req.body;

  if (!username || !first_name || !last_name || !email || !password) {
    return res.status(400).json({
      error:
        'Please provide username, email, first name, last name, and password for registration.',
    });
  }

  const password_hash = bcrypt.hashSync(password, 10);

  try {
    const query = `
      INSERT INTO users (username, first_name, last_name, email, password_hash)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [username, first_name, last_name, email, password_hash];

    const result = await client.query(query, values);

    res.status(201).json({
      message: `User ${result.rows[0].username} registered successfully.`,
    });
    // Assign the new user the default role (3: 'user')
    const roleQuery = `
      INSERT INTO user_roles (user_id, role_id)
      VALUES ($1, 3);
    `;
    try {
      await client.query(roleQuery, [result.rows[0].user_id]);
    } catch (err) {
      console.error('Error assigning default role to user', err);
    }
  } catch (err: any) {
    console.error('Error creating user', err);
    if (err.code === '23505') {
      res.status(409).json({ error: 'Username or email already exists.' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Login user
app.post('/login', async (req: Request, res: Response): Promise<any> => {
  if (req.body === undefined) {
    return res.status(400).json({ error: 'Please provide a request body.' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: 'Please provide username and password for login.' });
  }

  try {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await client.query(query, [username]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = result.rows[0];

    if (!bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid password.' });
    }

    // Remove the password hash from the user object
    delete user.password_hash;

    res.json(user);
  } catch (err) {
    console.error('Error logging in user', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check role
app.get('/roles', async (req: Request, res: Response): Promise<any> => {
  const { id } = req.query;

  try {
    const query = `
    SELECT r.role_name, r.role_display_name
    FROM roles r
    JOIN user_roles ur ON r.role_id = ur.role_id
    WHERE ur.user_id = $1
    `;
    const result = await client.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User or role(s) not found.' });
    }

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching role.', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.get(
  '/getDatabaseViewColumns',
  async (req: Request, res: Response): Promise<any> => {
    try {
      const query = `
    SELECT * 
    FROM database_view_columns
    `;
      const result = await client.query(query);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Database views not found.' });
      }

      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching database views.', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
);

app.get(
  '/getCatalogData',
  async (req: Request, res: Response): Promise<any> => {
    try {
      const query = `
    SELECT * 
    FROM catalog
    ORDER BY status ASC, created_at DESC;
    `;
      const result = await client.query(query);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Catalog data not found.' });
      }

      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching catalog data.', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
);

app.get('/getStatuses', async (req: Request, res: Response): Promise<any> => {
  try {
    const query = `
      SELECT * 
      FROM item_statuses
    `;
    const result = await client.query(query);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item statuses not found.' });
    }

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching item statuses.', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Checkout an item
app.post('/checkout', async (req: Request, res: Response): Promise<any> => {
  const { user_id, item_id } = req.query;

  if (!user_id || !item_id) {
    return res
      .status(400)
      .json({ error: 'Please provide user ID and item ID.' });
  }

  try {
    // Check if the item is available
    const itemQuery = 'SELECT status FROM catalog WHERE id = $1';
    const itemResult = await client.query(itemQuery, [item_id]);

    if (itemResult.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found.' });
    }

    const itemStatus = itemResult.rows[0].status;
    const availableStatusId = (
      await client.query(
        "SELECT id FROM item_statuses WHERE status_name = 'available'"
      )
    ).rows[0].id;

    if (itemStatus !== availableStatusId) {
      return res
        .status(400)
        .json({ error: 'Item is not available for checkout.' });
    }

    // Insert into checked_out table
    const checkoutQuery = `
      INSERT INTO checked_out (item_id, user_id)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const checkoutResult = await client.query(checkoutQuery, [
      item_id,
      user_id,
    ]);

    // Update the item status to 'checked_out'
    const checkedOutStatusId = (
      await client.query(
        "SELECT id FROM item_statuses WHERE status_name = 'checked_out'"
      )
    ).rows[0].id;
    const updateStatusQuery = 'UPDATE catalog SET status = $1 WHERE id = $2';
    await client.query(updateStatusQuery, [checkedOutStatusId, item_id]);

    res.status(201).json({
      message: 'Item checked out successfully.',
      checkout: checkoutResult.rows[0],
    });
  } catch (err) {
    console.error('Error checking out item', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Return an item
app.post('/return', async (req: Request, res: Response): Promise<any> => {
  const { user_id, item_id } = req.query;

  if (!user_id || !item_id) {
    return res
      .status(400)
      .json({ error: 'Please provide user ID and item ID.' });
  }

  try {
    // Check if the item is checked out by the user
    const checkoutQuery = `
      SELECT * 
      FROM checked_out 
      WHERE item_id = $1 AND user_id = $2
    `;
    const checkoutResult = await client.query(checkoutQuery, [
      item_id,
      user_id,
    ]);

    if (checkoutResult.rows.length === 0) {
      return res.status(404).json({ error: 'Checked out item not found.' });
    }

    // Delete the entry from checked_out table
    const deleteQuery = `
      DELETE FROM checked_out 
      WHERE item_id = $1 AND user_id = $2
    `;
    await client.query(deleteQuery, [item_id, user_id]);

    // Update the item status to 'available'
    const availableStatusId = (
      await client.query(
        "SELECT id FROM item_statuses WHERE status_name = 'available'"
      )
    ).rows[0].id;
    const updateStatusQuery = 'UPDATE catalog SET status = $1 WHERE id = $2';
    await client.query(updateStatusQuery, [availableStatusId, item_id]);

    res.status(200).json({ message: 'Item returned successfully.' });
  } catch (err) {
    console.error('Error returning item', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get(
  '/getCheckedOutItems',
  async (req: Request, res: Response): Promise<any> => {
    const { user_id } = req.query;

    try {
      let query = `
      SELECT co.item_id, co.user_id, co.checked_out_at, dvc.display_name, c.tag_data, c.args
      FROM checked_out co
      JOIN catalog c ON co.item_id = c.id
      JOIN database_types dt ON c.type_id = dt.id
      JOIN database_view_columns dvc ON c.type_id = dvc.type_id
      ORDER BY co.checked_out_at DESC
    `;
      const queryParams: (string | number)[] = [];

      if (user_id) {
        query += ' WHERE co.user_id = $1';
        queryParams.push(Number(user_id));
      }

      const result = await client.query(query, queryParams);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'No checked out items found.' });
      }

      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching checked out items', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Start the Express server
app.listen(port, () => {
  console.log(`The server is running at http://localhost:${port}`);
});
