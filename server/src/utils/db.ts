// Sequelize ORM (Typescript version)
import { Sequelize } from "sequelize-typescript";

// Connect to the database
const db = new Sequelize({
    database: 'some_db',
    dialect: 'sqlite',
    username: 'root',
    password: '',
    storage: ':memory:',
    models: [__dirname + '/../models'] 
  })

export { db, Sequelize }