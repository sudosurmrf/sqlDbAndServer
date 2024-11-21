const {
    client,
    createTables,
    createProduct,
    createUser,
    fetchUsers,
    fetchProducts,
    fetchFavorites,
    createFavorite,
    destroyFavorite
} = require('./db');

const express = require('express');
const app = express();
app.use(express.json());
const pg = require('pg');

app.get('/api/users', async (req, res, next) => {
    try {
        res.send(await fetchUsers());
    }
    catch (err) {
        next(err);
    }
});

app.get('/api/products', async (req, res, next) => {
    try {
        res.send(await fetchProducts());
    }
    catch (err) {
        next(err);
    }
});
// fetch the favorites of the user based on their user_id (id)
app.get('/api/users/:id/favorites', async (req, res, next) => {
    const { id } = req.params; // in order to get the id from the url we need to use req.params
    try {
        res.send(await fetchFavorites(id));
    }
    catch (err) {
        next(err);
    }
});

app.delete('/api/users/:username/favorites/:productname', async (req, res, next) => {
    const { username, productname } = req.params;
    try {
        await destroyFavorite({ username, productname });
        res.status(201).send({message: 'Deleted!'})
    }
    catch (err) {
        next(err);
    }
});

app.post('/api/users/:username/favorites', async (req, res, next) => {
    const { username } = req.params;
    const { productName } = req.body;

    try {
        res.status(201).send(await createFavorite({ username, productName}));
    }
    catch (err) {
        next(err);
    }
});

const init = async () => {
    await client.connect();
    console.log('connected to database');
    await createTables();
    console.log('created tables');
    const [] = await Promise.all([
        createUser({ username: 'James', password: 'hello' }),
        createUser({ username: 'Ben', password: 'hello' }),
        createUser({ username: 'Tim', password: 'hello' }),
        createUser({ username: 'Jim', password: 'hello' }),
        createProduct({ name: 'Car' }),
        createProduct({ name: 'Computer' }),
        createProduct({ name: 'smart phone' }),

    ]);

    const favorite = await createFavorite({

        username: 'Ben',
        productName: 'Car'
    });
    console.log(favorite)
    const favorite2 = await createFavorite({

        username: 'Tim',
        productName: 'Computer',
    });
    console.log(favorite2)
    // await destroyFavorite({ favorite_id: favorite2.id });

};




const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
});



init();