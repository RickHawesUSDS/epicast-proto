// Sequelize ORM (Typescript version)
import { Sequelize } from "sequelize-typescript";
import { getLogger } from '@/utils/loggers';

const logger = getLogger('DB')

// Connect to the database
const db = new Sequelize({
    database: 'some_db',
    dialect: 'sqlite',
    username: 'root',
    password: '',
    storage: ':memory:',
    logging: msg => logger.debug(msg),
    models: [__dirname + '/../models'] 
  })

export { db, Sequelize }