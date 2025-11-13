import { caller } from "@/trpc/server";

export default async function Home() {
  const data = await caller.createAI({ text: "singhal" });
  return <main>{JSON.stringify(data)}</main>;
}
