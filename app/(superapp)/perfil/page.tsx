import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileClient } from "./profile-client";

export default async function PerfilPage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      nome: true,
      email: true,
      matricula: true,
      cargo: true,
      departamento: true,
    }
  });

  if (!user) {
    redirect("/auth/login");
  }

  return <ProfileClient user={user} />;
}
