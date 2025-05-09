import { Pool, PoolConfig } from "pg";
import dotenv from "dotenv";
import { io, pool } from "./index";

dotenv.config();

export const createPool = (): Pool => {
  const poolConfig: PoolConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  }
  
  return new Pool(poolConfig);
};

// Setup listeners
export async function setupDatabaseListeners() {
  const client = await pool.connect();
  try {
    // Create triggers for slots table
    await client.query(`
      CREATE OR REPLACE FUNCTION notify_slot_change()
      RETURNS TRIGGER AS $$
      BEGIN
        IF TG_OP = 'INSERT' THEN
          PERFORM pg_notify('slot_changes', json_build_object(
            'action', 'create',
            'data', row_to_json(NEW)
          )::text);
        ELSIF TG_OP = 'UPDATE' THEN
          PERFORM pg_notify('slot_changes', json_build_object(
            'action', 'update',
            'data', row_to_json(NEW)
          )::text);
        ELSIF TG_OP = 'DELETE' THEN
          PERFORM pg_notify('slot_changes', json_build_object(
            'action', 'delete',
            'data', row_to_json(OLD)
          )::text);
        END IF;
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS slot_change_trigger ON "Slots";
      CREATE TRIGGER slot_change_trigger
      AFTER INSERT OR UPDATE OR DELETE ON "Slots"
      FOR EACH ROW EXECUTE FUNCTION notify_slot_change();
    `);

    // Create triggers for sessions table
    await client.query(`
      CREATE OR REPLACE FUNCTION notify_session_change()
      RETURNS TRIGGER AS $$
      DECLARE slot_start_time TIMESTAMP;
      DECLARE customer_full_name TEXT;
      DECLARE customer_email TEXT;
      DECLARE customer_phone_number TEXT;

      BEGIN
        SELECT "startTime" INTO slot_start_time
        FROM "Slots"
        WHERE "id" = NEW."slotId";

        SELECT ("firstName" || "lastName") INTO customer_full_name
        FROM "Customers"
        WHERE "id" = OLD."customerId";

        SELECT "email" INTO customer_email
        FROM "Customers"
        WHERE "id" = OLD."customerId";

        SELECT "phoneNumber" INTO customer_phone_number
        FROM "Customers"
        WHERE "id" = OLD."customerId";

        IF TG_OP = 'INSERT' THEN
          PERFORM pg_notify('session_changes', json_build_object(
            'action', 'create',
            'data', json_build_object(
              'id', NEW."id",
              'slotId', NEW."slotId",
              'employeeId', NEW."employeeId",
              'customerId', NEW."customerId",
              'message', NEW."message",
              'createdAt', NEW."createdAt",
              'updatedAt', NEW."updatedAt",
              'startTime', slot_start_time,
              'customerEmail', customer_email,
              'customerFullName', customer_full_name,
              'customerPhoneNumber', customer_phone_number
            )
          )::text);
        ELSIF TG_OP = 'UPDATE' THEN
          PERFORM pg_notify('session_changes', json_build_object(
            'action', 'update',
            'data', json_build_object(
              'id', NEW."id",
              'slotId', NEW."slotId",
              'employeeId', NEW."employeeId",
              'customerId', NEW."customerId",
              'message', NEW."message",
              'createdAt', NEW."createdAt",
              'updatedAt', NEW."updatedAt",
              'startTime', slot_start_time,
              'customerEmail', customer_email,
              'customerFullName', customer_full_name,
              'customerPhoneNumber', customer_phone_number
            )
          )::text);
        ELSIF TG_OP = 'DELETE' THEN
          PERFORM pg_notify('session_changes', json_build_object(
            'action', 'delete',
            'data', json_build_object(
              'id', OLD."id",
              'slotId', OLD."slotId",
              'employeeId', OLD."employeeId",
              'customerId', OLD."customerId",
              'message', OLD."message",
              'createdAt', OLD."createdAt",
              'updatedAt', OLD."updatedAt",
              'startTime', slot_start_time,
              'customerEmail', customer_email,
              'customerFullName', customer_full_name,
              'customerPhoneNumber', customer_phone_number
            )
          )::text);
        END IF;
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS session_change_trigger ON "Sessions";
      CREATE TRIGGER session_change_trigger
      AFTER INSERT OR UPDATE OR DELETE ON "Sessions"
      FOR EACH ROW EXECUTE FUNCTION notify_session_change();
    `);

    // Setup listeners
    await client.query("LISTEN slot_changes");
    await client.query("LISTEN session_changes");

    client.on("notification", (msg) => {
      if (msg.payload) {
        const payload = JSON.parse(msg.payload);
        if (msg.channel === "slot_changes") {
          io.sockets.emit("slots", {
            eventAction: payload.action,
            data: payload.data
          });
        } else if (msg.channel === "session_changes") {
          io.sockets.emit("sessions", {
            eventAction: payload.action,
            data: payload.data
          });
        }
      }
    });
  } catch (error) {
    console.error("Error setting up database listeners:", error);
  } finally {
    client.release();
  }
}