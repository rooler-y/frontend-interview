"use client";

/**
 * ─────────────────────────────────────────────────────────────────
 *  SPOT THE BUG — Code Review Round
 *  Time: ~5–7 minutes (discuss, don't type)
 * ─────────────────────────────────────────────────────────────────
 *
 *  INSTRUCTIONS FOR CANDIDATE:
 *    Each snippet below has one or more bugs.
 *    For each one:
 *      1. Identify what is wrong
 *      2. Explain the consequence (what breaks at runtime?)
 *      3. Show the fix
 *
 *  This is a READ + EXPLAIN exercise — you don't need to run it.
 * ─────────────────────────────────────────────────────────────────
 */

// ─────────────────────────────────────────────────────────────────
//  BUG 1 — Axios: missing await
//  Q: What does fetchUser actually return? What happens to the error?
// ─────────────────────────────────────────────────────────────────

import axios from "axios";

async function fetchUser(id: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/await-thenable
    const res = axios.get(`/api/users/${id}`); // <-- bug here
    // @ts-expect-error intentional bug — spot it!
    return res.data;
  } catch (e) {
    console.error("Failed to fetch user", e);
  }
}

// ─────────────────────────────────────────────────────────────────
//  BUG 2 — Stale closure in useEffect
//  Q: What value does `count` always have inside the interval?
//     What does the user see vs what they expect?
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(count + 1); // <-- bug here
    }, 1000);

    return () => clearInterval(interval);
  }, []); // <-- related bug here

  return <p>Count: {count}</p>;
}

// ─────────────────────────────────────────────────────────────────
//  BUG 3 — Zustand selector causing re-renders on every state change
//  Q: Why does this component re-render even when `members` doesn't change?
//     How would you fix it?
// ─────────────────────────────────────────────────────────────────

import { create } from "zustand";

interface Store {
  count: number;
  label: string;
  increment: () => void;
}

const useStore = create<Store>((set) => ({
  count: 0,
  label: "clicks",
  increment: () => set((s) => ({ count: s.count + 1 })),
}));

function ClickLabel() {
  const { label } = useStore(); // <-- bug here: subscribes to the whole store
  return <span>{label}</span>;
}

// ─────────────────────────────────────────────────────────────────
//  BUG 4 — Race condition: async fetch without cleanup
//  Q: What happens if `userId` changes quickly (e.g. user types fast)?
//     What React warning appears in the console?
// ─────────────────────────────────────────────────────────────────

function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    axios.get(`/api/users/${userId}`).then((res) => {
      setUser(res.data); // <-- bug: no cancellation / stale response guard
    });
  }, [userId]); // <-- missing cleanup return

  return <p>{user?.name ?? "Loading..."}</p>;
}

// ─────────────────────────────────────────────────────────────────
//  BUG 5 — Axios interceptor: infinite retry loop on 401
//  Q: What happens when the refresh token request itself returns 401?
//     How do you prevent an infinite loop?
// ─────────────────────────────────────────────────────────────────

const api = axios.create({ baseURL: "/api" });

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await api.post("/auth/refresh"); // <-- bug: uses same intercepted instance
      return api(error.config); // <-- retries forever if refresh also 401s
    }
    return Promise.reject(error);
  },
);

// ─────────────────────────────────────────────────────────────────
//  PAGE — renders nothing, just a reference file for the interview
// ─────────────────────────────────────────────────────────────────

export default function BugsPage() {
  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center p-10">
      <div className="max-w-xl text-center space-y-2">
        <h1 className="text-2xl font-semibold">Spot the Bug</h1>
        <p className="text-muted-foreground text-sm">
          Open{" "}
          <code className="font-mono bg-muted px-1 rounded">
            app/challenge/bugs/page.tsx
          </code>{" "}
          and walk through each snippet with your interviewer.
        </p>
      </div>
    </div>
  );
}
