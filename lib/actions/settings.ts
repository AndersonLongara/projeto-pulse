"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateThemeSchema = z.object({
  theme: z.enum(["system", "light", "dark"]),
});

export async function updateTheme(data: z.infer<typeof updateThemeSchema>) {
  const session = await getSession();

  if (!session?.id) {
    return { error: "Não autenticado" };
  }

  const validation = updateThemeSchema.safeParse(data);

  if (!validation.success) {
    return { error: "Tema inválido" };
  }

  try {
    await prisma.user.update({
      where: { id: session.id },
      data: { theme: validation.data.theme },
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Error updating theme:", error);
    return { error: "Erro ao atualizar tema" };
  }
}

export async function getUserTheme() {
  const session = await getSession();

  if (!session?.id) {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { theme: true },
    });

    return user?.theme ?? "system";
  } catch (error) {
    console.error("Error fetching theme:", error);
    return "system";
  }
}
