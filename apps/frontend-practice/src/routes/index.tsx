import { Button } from "@acme/ui/components/button";
import { Card, CardContent, CardHeader } from "@acme/ui/components/card";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { FileRoutesByTo } from "@/routeTree.gen";

export const Route = createFileRoute("/")({
  component: App,
});

const links: Array<{ to: keyof FileRoutesByTo; label: React.ReactNode }> = [
  {
    label: "Task Queue",
    to: "/task-queue",
  },
  {
    label: "Community Posts",
    to: "/community-posts",
  },
  {
    label: "Select Component",
    to: "/select-component",
  },
  {
    label: "Bitcoin Form",
    to: "/bitcoin-form",
  },
];

function App() {
  return (
    <main className="flex min-h-svh items-center justify-center">
      <Card className="container flex max-w-lg flex-col gap-y-4">
        <CardHeader className="text-lg font-bold">Practice Problems</CardHeader>
        <CardContent>
          <ul>
            {links.map((link) => (
              <li key={link.to}>
                <Button asChild variant="link">
                  <Link to={link.to}>{link.label}</Link>
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}
