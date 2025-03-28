import express from 'express';
import bcrypt from 'bcrypt';
import type { Request, Response } from 'express';
import { Client } from 'pg';
import swaggerUi from 'swagger-ui-express';
import axios from 'axios';
import { JSDOM } from 'jsdom';

require('dotenv').config();

// Create a new express application instance
const app = express();

// Set the network port
const port = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Enable CORS
const cors = require('cors');
app.use(cors());

// Import the swagger JSON and display it on the /docs route
const swaggerDocument = require('./swagger.json');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Database connection details
const client = new Client({
  user: process.env.DB_USER || 'stims_db_admin',
  host: process.env.DB_HOST || '172.20.0.4',
  database: process.env.DB_NAME || 'stims_db',
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

client
  .connect()
  .then(() => console.log('Connected to the PostgreSQL database'))
  .catch((err) => console.error('Connection error', err));

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

// Get all users with their roles
app.get('/getAllUsers', async (req: Request, res: Response): Promise<any> => {
  try {
    const query = `
      SELECT 
      u.user_id, 
      u.first_name, 
      u.last_name, 
      u.username, 
      json_agg(json_build_object('role_id', r.role_id, 'role_name', r.role_name, 'role_display_name', r.role_display_name)) AS roles
      FROM users u
      LEFT JOIN user_roles ur ON u.user_id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.role_id
      GROUP BY u.user_id
      ORDER BY u.user_id;
    `;
    const result = await client.query(query);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No users found.' });
    }

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users.', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Edit user roles
app.post(
  '/editUserRoles',
  async (req: Request, res: Response): Promise<any> => {
    const { user_id, roles } = req.body;

    if (!user_id || !Array.isArray(roles)) {
      return res.status(400).json({
        error: 'Please provide user_id and an array of roles.',
      });
    }

    try {
      // Delete existing roles for the user
      const deleteQuery = 'DELETE FROM user_roles WHERE user_id = $1';
      await client.query(deleteQuery, [user_id]);

      // Insert new roles for the user
      const insertQuery =
        'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)';
      for (const role_id of roles) {
        await client.query(insertQuery, [user_id, role_id]);
      }

      res.status(200).json({ message: 'User roles updated successfully.' });
    } catch (err) {
      console.error('Error updating user roles', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

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

// Get all roles
app.get('/getAllRoles', async (req: Request, res: Response): Promise<any> => {
  try {
    const query = 'SELECT role_id, role_name, role_display_name FROM roles';
    const result = await client.query(query);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No roles found.' });
    }

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching roles.', err);
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
  '/getDatabaseItemTypes',
  async (req: Request, res: Response): Promise<any> => {
    try {
      const query = `
        SELECT *
        FROM database_types dt
        JOIN database_view_columns dvc ON dt.id = dvc.type_id
      `;
      const result = await client.query(query);

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ error: 'Database item types not found.' });
      }

      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching database item types.', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
);

app.get(
  '/getCheckedOutItemsByUserId',
  async (req: Request, res: Response): Promise<any> => {
    const { user_id } = req.query;

    try {
      if (!user_id) {
        return res.status(400).json({ error: 'Please provide user ID.' });
      }

      const query = `
      SELECT co.item_id, co.user_id, co.checked_out_at, dvc.display_name, c.tag_data, c.args
      FROM checked_out co
      JOIN catalog c ON co.item_id = c.id
      JOIN database_types dt ON c.type_id = dt.id
      JOIN database_view_columns dvc ON c.type_id = dvc.type_id
      WHERE co.user_id = $1
      ORDER BY co.checked_out_at DESC
        `;
      const queryParams: (string | number)[] = [Number(user_id)];

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

app.get(
  '/getAllCheckedOutItems',
  async (req: Request, res: Response): Promise<any> => {
    try {
      const query = `
        SELECT 
          c.id as item_id,
          dvc.display_name as type_display_name, 
          c.args, 
          u.user_id,
          u.username,
          u.first_name, 
          u.last_name, 
          u.email, 
          co.checked_out_at
        FROM checked_out co
        JOIN catalog c ON co.item_id = c.id
        JOIN users u ON co.user_id = u.user_id
        JOIN database_types dt ON c.type_id = dt.id
        JOIN database_view_columns dvc ON c.type_id = dvc.type_id
        ORDER BY co.checked_out_at DESC;
      `;
      const result = await client.query(query);

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ error: 'No currently checked out items found.' });
      }

      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching currently checked out items', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Return all items
app.post(
  '/returnAllItems',
  async (req: Request, res: Response): Promise<any> => {
    try {
      // Delete all entries from checked_out table
      const deleteQuery = 'DELETE FROM checked_out RETURNING item_id';
      const deleteResult = await client.query(deleteQuery);

      if (deleteResult.rows.length === 0) {
        return res.status(404).json({ error: 'No checked out items found.' });
      }

      // Update the status of all items to 'available'
      const availableStatusId = (
        await client.query(
          "SELECT id FROM item_statuses WHERE status_name = 'available'"
        )
      ).rows[0].id;
      const updateStatusQuery =
        'UPDATE catalog SET status = $1 WHERE id = ANY($2::int[])';
      const itemIds = deleteResult.rows.map(
        (row: { item_id: number }) => row.item_id
      );
      await client.query(updateStatusQuery, [availableStatusId, itemIds]);

      res.status(200).json({ message: 'All items returned successfully.' });
    } catch (err) {
      console.error('Error returning all items', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Add a new item to the catalog
app.post('/addItem', async (req: Request, res: Response): Promise<any> => {
  const { type_id, tag_data, args, status, image } = req.body;

  if (!type_id || !tag_data || !args || !status) {
    return res.status(400).json({
      error: 'Please provide type_id, tag_data, args, and status for the item.',
    });
  }

  try {
    const query = `
      INSERT INTO catalog (type_id, tag_data, args, status, image)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [type_id, tag_data, args, status, image || ''];

    const result = await client.query(query, values);

    res.status(201).json({
      message: 'Item added to catalog successfully.',
      item: result.rows[0],
    });
  } catch (err) {
    console.error('Error adding item to catalog', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new item type
app.post('/addItemType', async (req: Request, res: Response): Promise<any> => {
  const {
    type_name,
    tag_type_id,
    args,
    display_name,
    display_name_plural,
    description,
    icon,
  } = req.body;

  if (
    !type_name ||
    !tag_type_id ||
    !args ||
    !display_name ||
    !display_name_plural
  ) {
    return res.status(400).json({
      error:
        'Please provide type_name, tag_type_id, args, display_name, and display_name_plural for the item type.',
    });
  }

  try {
    // Insert into database_types table
    const typeQuery = `
      INSERT INTO database_types (type_name, tag_type_id, args)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const typeValues = [type_name, tag_type_id, JSON.stringify(args)];
    const typeResult = await client.query(typeQuery, typeValues);

    // Insert into database_view_columns table
    const viewQuery = `
      INSERT INTO database_view_columns (type_id, type_name, display_name, display_name_plural, description, icon)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const viewValues = [
      typeResult.rows[0].id,
      type_name,
      display_name,
      display_name_plural,
      description || '',
      icon || '',
    ];
    const viewResult = await client.query(viewQuery, viewValues);

    res.status(201).json({
      message: 'Item type added successfully.',
      itemType: typeResult.rows[0],
      viewColumn: viewResult.rows[0],
    });
  } catch (err: any) {
    console.error('Error adding item type', err);
    if (err.code === '23505') {
      res.status(409).json({ error: 'Type name already exists.' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

app.get('/searchImage', async (req: Request, res: Response): Promise<any> => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Please provide a search query.' });
  }

  try {
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(
      query as string
    )}`;

    const response = await axios.get(url, { responseType: 'text' });
    const dom = new JSDOM(response.data);
    const firstImage = dom.window.document.querySelector(
      '.mimg'
    ) as HTMLImageElement;

    if (firstImage && firstImage.src) {
      res.json({ imageUrl: firstImage.src });
    } else {
      res.status(404).json({ error: 'No image found.' });
    }
  } catch (err) {
    console.error('Error fetching image', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`The server is running at http://localhost:${port}`);
});
