/**
 * Database Connection for Droply
 *
 * This file sets up the connection to our Neon PostgreSQL database using Drizzle ORM.
 * We're using the HTTP-based driver which is optimized for serverless environments.
 */

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";


const sql = neon(process.env.DATABASE_URL!);


export const db = drizzle(sql, { schema });


export { sql };
