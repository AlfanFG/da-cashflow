import { auth } from "@/auth";
import { logoutUser } from "@/lib/actions/auth.actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User as UserIcon, Settings } from "lucide-react";
import Link from "next/link";

export async function UserNav() {
  const session = await auth();
  const name = session?.user?.name || "Pengguna";
  const email = session?.user?.email || "";
  const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative h-9 w-9 rounded-full ml-4 inline-flex items-center justify-center hover:bg-slate-100 transition-colors focus:outline-none">
        <Avatar className="h-9 w-9 border border-slate-200">
          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} alt={name} />
          <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-semibold leading-none text-slate-800">{name}</p>
              <p className="text-xs leading-none text-muted-foreground">{email}</p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <Link href="/dashboard/profile">
          <DropdownMenuItem className="cursor-pointer flex w-full items-center">
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
        </Link>
        <Link href="/dashboard/settings">
          <DropdownMenuItem className="cursor-pointer flex w-full items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <form action={logoutUser}>
          <button type="submit" className="w-full">
            <DropdownMenuItem className="cursor-pointer flex w-full items-center text-red-600 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
