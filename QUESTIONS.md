# Frontend Interview Questions

**Format:** ~5 minutes verbal · pick 4–5 questions · 1 from each section

---

## React & Next.js App Router

1. **What's the practical difference between a Server Component and a Client Component?**  
   Follow-up: _If a Server Component renders a Client Component that renders another Server Component — does that inner one run on the server?_

   > Good answer: SC runs on server, no JS shipped, can be async. CC runs in browser. The inner SC would need to be passed as `children` — you can't import an SC inside a CC.

2. **When does `useEffect` still have a legitimate place in the App Router world?**

   > Good answer: browser-only side effects (event listeners, `document`, third-party SDKs), not data fetching. Bad answer: "for fetching data."

3. **Our app uses both streaming AI responses (AI SDK) and real-time events (Socket.io). How would you architect a page that needs both simultaneously?**

   > Tests understanding of `useEffect` for socket subscription lifecycle, RSC boundaries, and streaming via `ReadableStream` / `useObject`.

4. **What problem does Turbopack solve vs Webpack, and are there any trade-offs you've noticed?**
   > Good: faster cold start, incremental compilation. Trade-off: not all loaders ported yet, some edge cases with older plugins.

---

## TypeScript

5. **What's the difference between `unknown` and `any`? Give me a scenario where you'd use `unknown`.**

   > Good answer: `unknown` forces a type guard before use. Ideal for API responses, Zod's pre-parse type, error handler `catch(e: unknown)`.

6. **How would you type a function that accepts a union of two different event shapes and handles each differently?**

   > Looking for: discriminated union, narrowing with `in` operator or a literal discriminant field.

7. **We use `z.infer<typeof schema>` a lot. What does that give us compared to writing a manual interface?**
   > Single source of truth: runtime validation + compile-time types stay in sync automatically.

---

## State — Zustand

8. **Why would you choose Zustand over React Context + useReducer for a shared store?**

   > Key: no re-render on unrelated state slices, no Provider wrapper, simpler API, better devtools. Context re-renders all consumers on any change.

9. **How do you subscribe to only a slice of a Zustand store to avoid unnecessary re-renders?**

   > `useStore(s => s.specificField)` — selector pattern. Bonus: `useShallow` for object/array slices.

10. **If two components both call `useMembersStore` but select different slices, does updating one slice re-render the other component? Why or why not?**
    > No, because each selector returns a primitive (or shallow-equal value). Zustand uses strict equality by default.

---

## Forms & Validation — Zod

11. **What's the difference between `.parse()` and `.safeParse()`? When do you use each?**

    > `parse` throws; use it when an error means a programming mistake (env vars, config). `safeParse` returns `{ success, data | error }`; use it for user input so you can surface field errors.

12. **How would you validate a field that should only be required if another field has a specific value?**

    > `z.discriminatedUnion` or `.refine()` / `.superRefine()` on the object level.

13. **We deliberately avoid react-hook-form. What does that mean for how you manage field-level errors in a controlled form?**
    > Manual `useState` for values and errors, run `safeParse` on submit (or on blur), map `error.flatten().fieldErrors` to state.

---

## Styling — Tailwind + shadcn

14. **What problem does `cn()` (clsx + tailwind-merge) solve that plain template literals can't?**

    > tailwind-merge deduplicates conflicting utilities (`p-2 p-4` → `p-4`). clsx handles conditional/array/object syntax cleanly.

15. **shadcn/ui components use CVA (Class Variance Authority). What is CVA and why is it useful over a plain config object of strings?**

    > CVA generates a typed `className` function with variant + compound variant support. Gives autocomplete, type safety on variant props, and clean composition.

16. **How do you theme shadcn components across a Turbopack monorepo where the `@workspace/ui` package has its own Tailwind config?**
    > CSS variable approach: shadcn uses `--color-*` variables so theming lives in the host app's CSS. The shared package doesn't need its own Tailwind; it just uses the token variables.

---

## Real-time & Data

17. **How do you safely clean up a Socket.io subscription in React to avoid duplicate listeners across strict-mode double mounts?**

    > Return cleanup from `useEffect`: `socket.off('event', handler)` or `socket.disconnect()`. Store the handler reference outside the effect or use `socket.once`.

18. **With Axios interceptors in our stack — where would you add a retry-on-401 flow that refreshes a JWT and replays the original request?**

    > Response interceptor: catch `401`, call refresh endpoint, update token, `return axiosInstance(originalRequest)`. Guard with a flag (`isRefreshing`) to queue concurrent failed requests.

19. **TanStack Table is configured on the client. If the dataset is 50k rows, what do you do?**
    > Server-side pagination (`manualPagination: true`), or TanStack Virtual for windowed rendering if data is all in memory. Both — ideally.

---

## Architecture & Monorepo

20. **In a pnpm Turborepo workspace, when should a component live in `@workspace/ui` vs stay in the app itself?**

    > Shared: design system primitives used by ≥2 apps. App-specific: business logic, domain-aware components, anything coupled to a specific store or route.

21. **How do you prevent `@workspace/ui` from accidentally importing app-level code (e.g. a store specific to one app)?**
    > Dependency direction: `@workspace/ui` must not depend on any app package. Enforce with eslint `import/no-restricted-paths` or Turborepo task boundaries.

---

## Scoring Guide

| Answer quality                                             | Signal  |
| ---------------------------------------------------------- | ------- |
| Explains the _why_, not just the _what_                    | Strong  |
| Gives a concrete example from past work                    | Strong  |
| Knows the trade-offs                                       | Strong  |
| Only recalls the API surface                               | Average |
| Confuses concepts or gives a framework-agnostic non-answer | Weak    |
