import db from "../lib/db/db";
import { user } from "@/lib/db/schema";
import { asc, eq } from 'drizzle-orm';


export const addUser = async (id: number, name: string) => {
  await db.insert(user).values({
    id: id,
    name: name,
  });
};

export const getUsers = async () => {
    const data = await db.select().from(user).orderBy(asc(user.id));
    return data;
  };

  
export const editUser = async (id: number, name: string) => {
    await db
      .update(user)
      .set({
        name: name,
      })
      .where(eq(user.id, id));
  };

  export const deleteUser = async (id: number) => {
    await db.delete(user).where(eq(user.id, id));
  };