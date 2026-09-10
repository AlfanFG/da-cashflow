"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePassword } from "@/lib/actions/user.actions";
import { toast } from "sonner";

export function SettingsPasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password baru tidak cocok");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await changePassword({ currentPassword, newPassword });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Password berhasil diubah!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      toast.error("Gagal mengubah password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="current-password">Password Saat Ini</Label>
        <Input
          id="current-password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="h-11 rounded-lg"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="new-password">Password Baru</Label>
        <Input
          id="new-password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="h-11 rounded-lg"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="confirm-password">Konfirmasi Password Baru</Label>
        <Input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="h-11 rounded-lg"
        />
      </div>
      <div className="flex justify-end mt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : "Ubah Password"}
        </Button>
      </div>
    </form>
  );
}
