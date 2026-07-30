import { auth } from "@/lib/auth";
import { Hero } from "@/components/Hero";

export default async function Home() {
  const session = await auth();
  return <Hero user={session?.user ?? null} />;
}
