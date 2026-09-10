import { SettingsPasswordForm } from "@/components/profile/SettingsPasswordForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 pb-24 md:pb-0 max-w-2xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Settings</h1>
        <p className="text-slate-500 text-sm">Kelola keamanan dan preferensi akun Anda.</p>
      </div>

      <Card className="border-0 shadow-sm rounded-2xl">
        <CardHeader className="pb-2 border-b">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-slate-500" />
            <CardTitle className="text-base font-semibold text-slate-800">Ganti Password</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <SettingsPasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
