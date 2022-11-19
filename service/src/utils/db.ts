// Sequelize ORM (Typescript version)
import { Sequelize } from 'sequelize-typescript'
import { getLogger } from '@/utils/loggers'
import { join } from 'path'

const logger = getLogger('DB')

// Connect to the database
const db = new Sequelize({
  database: 'some_db',
  dialect: 'sqlite',
  username: 'root',
  password: '',
  storage: ':memory:',
  logging: msg => logger.debug(msg),
  models: [join(__dirname, '/../models/sequelizeModels')]
})

export { db, Sequelize }
