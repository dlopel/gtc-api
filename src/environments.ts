export default {
    "development": {
        "username": "postgres",
        "password": "lopeloyola",
        "database": "carvi_dev",
        "host": "localhost"
    },
    "test": {
        "username": process.env.TEST_DB_USER,
        "password": process.env.TEST_DB_PASSWORD,
        "database": process.env.TEST_DB_NAME,
        "host": process.env.TEST_DB_HOST
    },
    "production": {
        "username": process.env.PROD_DB_USER,
        "password": process.env.PROD_DB_PASSWORD,
        "database": process.env.PROD_DB_NAME,
        "host": process.env.PROD_DB_HOST
    }
}
