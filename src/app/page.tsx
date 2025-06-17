"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    fetch("/api/me").then(async (res) => {
      if (res.ok) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    });
  }, [router]);
  return null;
}
