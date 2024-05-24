"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "../lib/db";
import { user } from "../lib/schema";

export const getData = async () => {
    const data = await db.select().from(user);
    return data;
};

export const addUser = async (name: string) => {
    await db.insert(user).values({
        name: name,
    });
    revalidatePath("/");
};

export const deleteUser = async (id: number) => {
    await db.delete(user).where(eq(user.id, id));

    revalidatePath("/");
};

export const editUser = async (id: number, name: string) => {
    await db
        .update(user)
        .set({
            name: name,
        })
        .where(eq(user.id, id));

    revalidatePath("/");
};