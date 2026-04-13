"use client";

/**
 * ─────────────────────────────────────────────────────────────────
 *  FRONTEND INTERVIEW CHALLENGE — Team Members Dashboard
 *  Time: ~15 minutes
 * ─────────────────────────────────────────────────────────────────
 *
 *  WHAT'S PROVIDED:
 *    ✅ All imports
 *    ✅ TypeScript types
 *    ✅ Zustand store skeleton  (you fill in the actions)
 *    ✅ Page layout shell
 *
 *  YOUR TASKS (in order of priority):
 *
 *  TASK 1 — Zustand Store  ───────────────────────────────  ~3 min
 *    Implement `addMember` and `toggleStatus` in the store.
 *    addMember  → push a new member with status "online" and a uuid id
 *    toggleStatus → cycle: online → busy → offline → online
 *
 *  TASK 2 — Zod Schema  ──────────────────────────────────  ~2 min
 *    Fill in `addMemberSchema` with proper field rules:
 *      name  → min 2 chars
 *      email → valid email
 *      role  → min 2 chars
 *
 *  TASK 3 — MemberRow component  ─────────────────────────  ~5 min
 *    Render a single member row using:
 *      - <Avatar> with initials fallback (first letter of name)
 *      - Name + role text
 *      - <Badge> whose color reflects status  (see STATUS_STYLES map)
 *      - A "Toggle" button that calls toggleStatus
 *
 *  TASK 4 — AddMemberForm component  ─────────────────────  ~5 min
 *    A controlled form that:
 *      - Has <Input> fields for name, email, role
 *      - Validates with addMemberSchema.safeParse on submit
 *      - Shows field-level Zod errors inline
 *      - On success: calls addMember, resets the form, fires a sonner toast
 *      - On error: fires a sonner error toast AND shows inline errors
 *
 *  BONUS (if time allows):
 *    - Show the total online count in the Card header
 *    - Disable the "Add Member" button while the member list is empty
 * ─────────────────────────────────────────────────────────────────
 */

import { useState } from "react";
import { create } from "zustand";
import { z } from "zod";
import { toast, Toaster } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────
//  TYPES  (provided — do not change)
// ─────────────────────────────────────────────────────────────────

type Status = "online" | "busy" | "offline";

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  status: Status;
}

// ─────────────────────────────────────────────────────────────────
//  CONSTANTS  (provided)
// ─────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<Status, string> = {
  online: "bg-emerald-500/15 text-emerald-700 border-emerald-300",
  busy: "bg-amber-500/15 text-amber-700 border-amber-300",
  offline: "bg-zinc-500/15 text-zinc-500 border-zinc-300",
};

const SEED_MEMBERS: Member[] = [
  {
    id: "1",
    name: "Alice Kim",
    email: "alice@acme.com",
    role: "Lead Engineer",
    status: "online",
  },
  {
    id: "2",
    name: "Bruno Melo",
    email: "bruno@acme.com",
    role: "Product Designer",
    status: "busy",
  },
  {
    id: "3",
    name: "Chloe Tan",
    email: "chloe@acme.com",
    role: "Frontend Dev",
    status: "offline",
  },
];

// ─────────────────────────────────────────────────────────────────
//  TASK 1 — ZUSTAND STORE
// ─────────────────────────────────────────────────────────────────

interface MembersStore {
  members: Member[];
  addMember: (data: Omit<Member, "id" | "status">) => void;
  toggleStatus: (id: string) => void;
}

const useMembersStore = create<MembersStore>((set) => ({
  members: SEED_MEMBERS,

  addMember: (data) => {
    // TODO: push a new Member with a random id (crypto.randomUUID()) and status "online"
  },

  toggleStatus: (id) => {
    // TODO: cycle the member's status: online → busy → offline → online
  },
}));

// ─────────────────────────────────────────────────────────────────
//  TASK 2 — ZOD SCHEMA
// ─────────────────────────────────────────────────────────────────

const addMemberSchema = z.object({
  name: z.string(), // TODO: add .min(2, "Name must be at least 2 characters")
  email: z.string(), // TODO: add .email("Must be a valid email")
  role: z.string(), // TODO: add .min(2, "Role must be at least 2 characters")
});

type AddMemberFields = z.infer<typeof addMemberSchema>;

// ─────────────────────────────────────────────────────────────────
//  TASK 3 — MEMBER ROW COMPONENT
// ─────────────────────────────────────────────────────────────────

function MemberRow({ member }: { member: Member }) {
  const toggleStatus = useMembersStore((s) => s.toggleStatus);

  // TODO: implement this component
  // Requirements:
  //   - Avatar with initials fallback (first letter of member.name)
  //   - Name (font-medium) + role (text-sm text-muted-foreground) stacked vertically
  //   - Badge using STATUS_STYLES[member.status] for className, showing the status text
  //   - Button labeled "Toggle" that calls toggleStatus(member.id)
  //   - Layout: flex row, items-center, justify-between, gap-3, px-4 py-3

  return null;
}

// ─────────────────────────────────────────────────────────────────
//  TASK 4 — ADD MEMBER FORM COMPONENT
// ─────────────────────────────────────────────────────────────────

function AddMemberForm() {
  const addMember = useMembersStore((s) => s.addMember);

  const [fields, setFields] = useState<AddMemberFields>({
    name: "",
    email: "",
    role: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof AddMemberFields, string>>
  >({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO:
    //   1. Run addMemberSchema.safeParse(fields)
    //   2. If error: set inline errors + toast.error("Check the form fields")
    //   3. If success: call addMember(data), reset fields + errors, toast.success("Member added!")
  }

  // TODO: render Form UI
  // Requirements:
  //   - Three labeled <Input> fields: Name, Email, Role
  //   - Show field error below each input as <p className="text-destructive text-xs">
  //   - Submit <Button> labeled "Add Member"
  //   - Layout: flex flex-col gap-3

  return null;
}

// ─────────────────────────────────────────────────────────────────
//  PAGE SHELL  (provided — modify if you want, but not required)
// ─────────────────────────────────────────────────────────────────

export default function ChallengePage() {
  const members = useMembersStore((s) => s.members);

  return (
    <div className="min-h-screen bg-muted/40 flex items-start justify-center p-10">
      <Toaster richColors />

      <div className="w-full max-w-lg space-y-6">
        {/* Members List Card */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              {/* BONUS: show "X online" count here */}
              {members.length} total members
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {members.map((member) => (
              <div key={member.id}>
                <MemberRow member={member} />
                <Separator />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Add Member Card */}
        <Card>
          <CardHeader>
            <CardTitle>Add Member</CardTitle>
          </CardHeader>
          <CardContent>
            <AddMemberForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
