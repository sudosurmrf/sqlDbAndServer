const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_store_db');
const uuid = require('uuid');
const bcrypt = require('bcrypt');


const createTables = async () => {

    const SQL = `
        
    DROP TABLE IF EXISTS Favorites;
    DROP TABLE IF EXISTS Products;
    DROP TABLE IF EXISTS Users;

        CREATE TABLE users(
            id UUID PRIMARY KEY,
            username VARCHAR(50),
            password VARCHAR(255) 
        );
        CREATE TABLE products(
            id UUID PRIMARY KEY,
            name VARCHAR(50)
        );
        CREATE TABLE favorites(
            id UUID PRIMARY KEY,
            product_id UUID REFERENCES Products(id),
            user_id UUID REFERENCES Users(id),
            CONSTRAINT unique_user_id_product_id UNIQUE (user_id, product_id),
            productname VARCHAR(255),
            username VARCHAR(50)
            
        );
    `;

    await client.query(SQL);

};


const createProduct = async ({ name }) => {
    const SQL = `
      INSERT INTO products(id, name) VALUES ($1, $2) RETURNING * 
    `;
    const response = await client.query(SQL, [uuid.v4(), name]);
    return response.rows[0];
};

const createUser = async ({username, password}) => {
    const pass = await bcrypt.hash(password, 5);

    const SQL = `
      INSERT INTO users(id, username, password) VALUES($1, $2, $3) RETURNING *
    `;
    const response = await client.query(SQL, [uuid.v4(), username, pass]);
    return response.rows[0];

}

const createFavorite = async ({ username, productName }) => {

    const product_id = await client.query(`
    SELECT id FROM products
    WHERE name=$1;`,[productName]);
    console.log(product_id.rows[0].id);

    const user_id = await client.query(`
    SELECT id FROM users
    WHERE username=$1;`,[username]);
    console.log(user_id.rows[0].id);
    const SQL = `
      INSERT INTO favorites(id, user_id, product_id, productname, username) VALUES ($1, $2, $3, $4, $5) RETURNING * 
    `;
    const response = await client.query(SQL, [uuid.v4(), user_id.rows[0].id, product_id.rows[0].id, productName, username]);
    return response.rows[0];
};

const fetchUsers = async () => {
    const SQL = `
      SELECT id, username 
      FROM users
    `;
    const response = await client.query(SQL);
    return response.rows;
};

const fetchProducts = async (req, res, next)=> {
    const SQL = `
    SELECT * FROM products;`
    const response = await client.query(SQL);
    return response.rows;
};


const fetchFavorites = async (user_id) => {
    const SQL = `
      SELECT * FROM favorites
      WHERE user_id = $1
    `;
    const response = await client.query(SQL, [user_id]);
    return response.rows;
};

const destroyFavorite = async ({ username,productname }) => {
    const SQL = `
      DELETE FROM favorites
      WHERE username = $1 AND productname = $2
    `;
    const response = await client.query(SQL, [username, productname]);
    return response
};


module.exports = {
    client,
    createTables,
    createProduct,
    createUser,
    fetchUsers,
    fetchProducts,
    createFavorite,
    fetchFavorites,
    destroyFavorite
};       