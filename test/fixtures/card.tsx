import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function Demo() {
  return (
    <Card data-testid="card">
      <CardHeader data-testid="header">
        <CardTitle>Notifications</CardTitle>
        <CardDescription>You have 3 unread messages.</CardDescription>
        <CardAction data-testid="action">
          <Button size="sm">Mark read</Button>
        </CardAction>
      </CardHeader>
      <CardContent data-testid="content">Body</CardContent>
      <CardFooter data-testid="footer">
        <Button>Save</Button>
      </CardFooter>
    </Card>
  );
}

export function Small() {
  return (
    <Card size="sm" data-testid="small">
      <CardHeader data-testid="small-header">
        <CardTitle>Small</CardTitle>
      </CardHeader>
      <CardContent data-testid="small-content">Body</CardContent>
      <CardFooter data-testid="small-footer">Footer</CardFooter>
    </Card>
  );
}

export function Custom() {
  return (
    <Card class="gap-2 rounded-none" id="c" aria-label="Custom card">
      <CardHeader class="px-2">
        <CardTitle class="text-xl">T</CardTitle>
        <CardDescription class="text-xs">D</CardDescription>
      </CardHeader>
      <CardContent class="px-2">C</CardContent>
      <CardFooter class="px-2">F</CardFooter>
    </Card>
  );
}
