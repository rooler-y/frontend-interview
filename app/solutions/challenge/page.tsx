"use client";

// ─────────────────────────────────────────────────────────────────
//  SOLUTION — Team Members Dashboard
// ─────────────────────────────────────────────────────────────────

import { useState } from "react";
import { create } from "zustand";
import { z } from "zod";
import { toast, Toaster } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
//  TYPES
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
//  CONSTANTS
// ─────────────────────────────────────────────────────────────────

const STATUS_CYCLE: Record<Status, Status> = {
  online: "busy",
  busy: "offline",
  offline: "online",
};

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
//  TASK 1 — ZUSTAND STORE  ✅
// ─────────────────────────────────────────────────────────────────

interface MembersStore {
  members: Member[];
  addMember: (data: Omit<Member, "id" | "status">) => void;
  toggleStatus: (id: string) => void;
}

const useMembersStore = create<MembersStore>((set) => ({
  members: SEED_MEMBERS,

  addMember: (data) =>
    set((state) => ({
      members: [
        ...state.members,
        { ...data, id: crypto.randomUUID(), status: "online" },
      ],
    })),

  toggleStatus: (id) =>
    set((state) => ({
      members: state.members.map((m) =>
        m.id === id ? { ...m, status: STATUS_CYCLE[m.status] } : m,
      ),
    })),
}));

// ─────────────────────────────────────────────────────────────────
//  TASK 2 — ZOD SCHEMA  ✅
// ─────────────────────────────────────────────────────────────────

const addMemberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Must be a valid email"),
  role: z.string().min(2, "Role must be at least 2 characters"),
});

type AddMemberFields = z.infer<typeof addMemberSchema>;

// ─────────────────────────────────────────────────────────────────
//  TASK 3 — MEMBER ROW  ✅
// ─────────────────────────────────────────────────────────────────

function MemberRow({ member }: { member: Member }) {
  // ✅ Selector — only re-renders this component when toggleStatus reference changes
  const toggleStatus = useMembersStore((s) => s.toggleStatus);

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      {/* Left: avatar + name/role */}
      <div className="flex items-center gap-3">
        <Avatar className="size-9">
          <AvatarFallback>{member.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium leading-none">{member.name}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{member.role}</p>
        </div>
      </div>

      {/* Right: badge + toggle */}
      <div className="flex items-center gap-2">
        <Badge
          className={cn("capitalize border", STATUS_STYLES[member.status])}
        >
          {member.status}
        </Badge>
        <Button
          size="sm"
          variant="outline"
          onClick={() => toggleStatus(member.id)}
        >
          Toggle
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  TASK 4 — ADD MEMBER FORM  ✅
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

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = addMemberSchema.safeParse(fields);

    if (!result.success) {
      // Map Zod field errors to flat string map
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        name: fieldErrors.name?.[0],
        email: fieldErrors.email?.[0],
        role: fieldErrors.role?.[0],
      });
      toast.error("Check the form fields");
      return;
    }

    addMember(result.data);
    setFields({ name: "", email: "", role: "" });
    setErrors({});
    toast.success("Member added!");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {/* Name */}
      <div className="space-y-1">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          value={fields.name}
          onChange={handleChange}
          placeholder="Jane Doe"
        />
        {errors.name && (
          <p className="text-destructive text-xs">{errors.name}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={fields.email}
          onChange={handleChange}
          placeholder="jane@acme.com"
        />
        {errors.email && (
          <p className="text-destructive text-xs">{errors.email}</p>
        )}
      </div>

      {/* Role */}
      <div className="space-y-1">
        <Label htmlFor="role">Role</Label>
        <Input
          id="role"
          name="role"
          value={fields.role}
          onChange={handleChange}
          placeholder="Frontend Dev"
        />
        {errors.role && (
          <p className="text-destructive text-xs">{errors.role}</p>
        )}
      </div>

      <Button type="submit" className="mt-1">
        Add Member
      </Button>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────
//  PAGE  ✅  (BONUS: online count in header)
// ─────────────────────────────────────────────────────────────────

export default function SolutionPage() {
  const members = useMembersStore((s) => s.members);
  // BONUS: derive online count without storing it separately
  const onlineCount = members.filter((m) => m.status === "online").length;

  return (
    <div className="min-h-screen bg-muted/40 flex items-start justify-center p-10">
      <Toaster richColors />

      <div className="w-full max-w-lg space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            {/* BONUS: online count */}
            <CardDescription>
              {members.length} total · {onlineCount} online
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
