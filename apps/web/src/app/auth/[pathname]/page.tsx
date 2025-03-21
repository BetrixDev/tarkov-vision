import { TopNav } from "@/components/top-nav";
import {
  ChangeEmailCard,
  DeleteAccountCard,
  SessionsCard,
  UpdateUsernameCard,
} from "@daveyplate/better-auth-ui";
import { authViewPaths } from "@daveyplate/better-auth-ui/server";

export function generateStaticParams() {
  return Object.values(authViewPaths).map((pathname) => ({ pathname }));
}

export default async function AuthPage() {
  return (
    <main className="h-screen flex flex-col">
      <TopNav />
      <div className="pt-8 mx-96 flex flex-col items-center gap-8 grow">
        <ChangeEmailCard
          className="rounded-none"
          classNames={{ input: "rounded-none", button: "rounded-none" }}
        />
        <UpdateUsernameCard
          className="rounded-none"
          classNames={{ input: "rounded-none", button: "rounded-none" }}
        />
        <SessionsCard
          className="rounded-none"
          classNames={{ cell: "rounded-none", button: "rounded-none" }}
        />
        <DeleteAccountCard
          className="rounded-none"
          classNames={{ button: "rounded-none" }}
        />
      </div>
    </main>
  );
}
