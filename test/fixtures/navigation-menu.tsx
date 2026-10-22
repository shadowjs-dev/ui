import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

export function Basic() {
  return (
    <NavigationMenu data-testid="nav" aria-label="Main">
      <NavigationMenuList>
        <NavigationMenuItem value="docs">
          <NavigationMenuTrigger data-testid="docs">Docs</NavigationMenuTrigger>
          <NavigationMenuContent data-testid="docs-content">
            <NavigationMenuLink href="/start" active data-testid="start">
              Get started
            </NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="about">
          <a href="/about" class={navigationMenuTriggerStyle()} data-testid="about">
            About
          </a>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export function Custom() {
  return (
    <NavigationMenu data-testid="custom" class="max-w-xs">
      <NavigationMenuList>
        <NavigationMenuItem value="x">
          <NavigationMenuTrigger>X</NavigationMenuTrigger>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export function WithViewport() {
  return (
    <NavigationMenu data-testid="nav" aria-label="Main">
      <NavigationMenuList>
        <NavigationMenuItem value="docs">
          <NavigationMenuTrigger data-testid="docs">Docs</NavigationMenuTrigger>
          <NavigationMenuContent data-testid="docs-content">
            <NavigationMenuLink href="/start" data-testid="start">
              Get started
            </NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuIndicator data-testid="indicator" />
      </NavigationMenuList>
      <NavigationMenuViewport data-testid="viewport" />
    </NavigationMenu>
  );
}
