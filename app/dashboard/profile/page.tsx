import { getProfile } from "@/lib/actions/user.actions";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const user = await getProfile();
  if (!user) redirect("/login");

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6 pb-24 md:pb-0 max-w-2xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Profile</h1>
        <p className="text-slate-500 text-sm">Kelola informasi akun Anda.</p>
      </div>

      {/* Avatar Card */}
      <Card className="border-0 shadow-sm rounded-2xl">
        <CardContent className="p-6 flex items-center gap-5">
          <Avatar className="h-20 w-20 border-2 border-emerald-100">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
              alt={user.name}
            />
            <AvatarFallback className="text-xl bg-emerald-100 text-emerald-700 font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1.5">
            <p className="text-xl font-bold text-slate-800">{user.name}</p>
            <div className="flex items-center gap-1.5 text-slate-500 text-sm">
              <Mail className="h-3.5 w-3.5" /> {user.email}
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 text-sm">
              <CalendarDays className="h-3.5 w-3.5" />
              Bergabung {format(new Date(user.createdAt), "dd MMMM yyyy")}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card className="border-0 shadow-sm rounded-2xl">
        <CardHeader className="pb-2 border-b">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-slate-500" />
            <CardTitle className="text-base font-semibold text-slate-800">Edit Informasi</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <ProfileForm defaultName={user.name} defaultEmail={user.email} />
        </CardContent>
      </Card>
    </div>
  );
}
