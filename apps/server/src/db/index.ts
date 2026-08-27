
import { drizzle } from 'drizzle-orm/node-postgres';
import {env } from '../env.js'

const db = drizzle(env.database!);

export {db};