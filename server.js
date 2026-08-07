const pg = require('pg');

function getSequelizeInstance() {
    if (!sequelize) {
        sequelize = new Sequelize(process.env.DATABASE_URL, {
            dialect: 'postgres',
            dialectModule: pg, // <--- Add this line to explicitly pass pg
            dialectOptions: {
                ssl: {
                    require: true,
                    rejectUnauthorized: false
                }
            },
            pool: {
                max: 2,
                min: 0,
                acquire: 30000,
                idle: 10000
            }
        });
    }
    return sequelize;
}