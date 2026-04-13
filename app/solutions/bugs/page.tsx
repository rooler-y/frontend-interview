"use client";

// ─────────────────────────────────────────────────────────────────
//  SOLUTION — Spot the Bug answers
// ─────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────
//  BUG 1 FIX — Add `await`
//
//  Problem:  Without await, `res` is a Promise, not an AxiosResponse.
//            `res.data` is undefined. The catch block never fires because
//            no exception is thrown — the promise is just silently dropped.
//  Fix:      await the call.
// ─────────────────────────────────────────────────────────────────

import axios from "axios";

async function fetchUser(id: string) {
  try {
    const res = await axios.get(`/api/users/${id}`); // ✅ added await
    return res.data;
  } catch (e) {
    console.error("Failed to fetch user", e);
  }
}

// ─────────────────────────────────────────────────────────────────
//  BUG 2 FIX — Stale closure
//
//  Problem:  `count` is closed over at the time the effect runs (value = 0).
//            Every tick calls setCount(0 + 1) = 1 forever — the counter
//            never goes past 1.
//  Fix:      Use the functional updater form so React provides the latest value.
//            Add `count` to the dependency array OR use the updater — updater
//            is cleaner and avoids tearing down/re-creating the interval.
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => prev + 1); // ✅ functional updater — no stale closure
    }, 1000);

    return () => clearInterval(interval);
  }, []); // ✅ empty deps is fine now because we don't read `count` directly

  return <p>Count: {count}</p>;
}

// ─────────────────────────────────────────────────────────────────
//  BUG 3 FIX — Zustand over-subscription
//
//  Problem:  useStore() with no selector subscribes to the entire store.
//            Any call to `increment` updates `count`, which triggers a
//            re-render of ClickLabel even though `label` never changed.
//  Fix:      Select only the slice you need.
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
  const label = useStore((s) => s.label); // ✅ selector — only re-renders when label changes
  return <span>{label}</span>;
}

// ─────────────────────────────────────────────────────────────────
//  BUG 4 FIX — Race condition / missing cleanup
//
//  Problem:  If userId changes before the first request resolves,
//            both requests are in-flight. Whichever resolves last wins,
//            even if it's the stale one. React also warns:
//            "Can't perform a React state update on an unmounted component."
//  Fix:      Use an `ignore` flag in the cleanup function.
// ─────────────────────────────────────────────────────────────────

function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    let ignore = false; // ✅ stale-request guard

    axios.get(`/api/users/${userId}`).then((res) => {
      if (!ignore) setUser(res.data); // ✅ only update if this effect is still current
    });

    return () => {
      ignore = true;
    }; // ✅ cleanup: mark any in-flight request as stale
  }, [userId]);

  return <p>{user?.name ?? "Loading..."}</p>;
}

// ─────────────────────────────────────────────────────────────────
//  BUG 5 FIX — Axios interceptor infinite loop
//
//  Problem:  The interceptor calls `api.post("/auth/refresh")` on the same
//            `api` instance, so a 401 from the refresh endpoint triggers the
//            interceptor again → infinite loop / stack overflow.
//            Also: no guard to prevent queueing multiple parallel refreshes.
//  Fix:      Use a plain axios instance (no interceptors) for the refresh call.
//            Add an `_retry` flag on the config to prevent double-retry.
// ─────────────────────────────────────────────────────────────────

const api = axios.create({ baseURL: "/api" });

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // ✅ prevent re-entry

      // ✅ use bare axios, NOT `api`, so the interceptor doesn't catch this call
      await axios.post("/api/auth/refresh");

      return api(originalRequest); // replay original request once
    }

    return Promise.reject(error);
  },
);

// ─────────────────────────────────────────────────────────────────
//  PAGE
// ─────────────────────────────────────────────────────────────────

export default function BugSolutionsPage() {
  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center p-10">
      <div className="max-w-xl text-center space-y-2">
        <h1 className="text-2xl font-semibold">Bug Solutions</h1>
        <p className="text-muted-foreground text-sm">
          Open{" "}
          <code className="font-mono bg-muted px-1 rounded">
            app/solutions/bugs/page.tsx
          </code>{" "}
          to review the fixes and explanations.
        </p>
      </div>
    </div>
  );
}
