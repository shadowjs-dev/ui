import { useSignal } from "@shadow-js/core";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
} from "@/components/ui/combobox";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { Label } from "@/components/ui/label";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
import {
  Pagination,
  PaginationContent,
  PaginationItems,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Toaster, useToast } from "@/components/ui/toast";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/** Every component of the registry in one application. */
/** A button that raises a toast through `useToast()`, under the `Toaster` the app renders. */
function ToastButton() {
  const toast = useToast();
  return <Button onClick={() => toast.success("Saved")}>Toast</Button>;
}

export function App() {
  const [name, setName] = useSignal("");
  return (
    <TooltipProvider>
      <SidebarProvider isMobile={false}>
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive>Home</SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <main>
            <SidebarTrigger />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Kitchen sink</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>Everything at once</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField name="name" field={{ value: name, error: () => (name() === "" ? "Required" : undefined), touched: () => true, onInput: (event) => setName((event.target as HTMLInputElement).value) }}>
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl as={Input} />
                    <FormDescription>Your public name.</FormDescription>
                    <FormMessage />
                  </FormItem>
                </FormField>
                <Label for="bio">Bio</Label>
                <Textarea id="bio" />
                <Checkbox aria-label="Accept" />
                <Switch aria-label="Airplane mode" />
                <RadioGroup defaultValue="a" aria-label="Plan">
                  <RadioGroupItem value="a" aria-label="Plan A" />
                  <RadioGroupItem value="b" aria-label="Plan B" />
                </RadioGroup>
                <Select defaultValue="apple">
                  <SelectTrigger aria-label="Fruit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apple">Apple</SelectItem>
                    <SelectItem value="pear">Pear</SelectItem>
                  </SelectContent>
                </Select>
                <Combobox>
                  <ComboboxInput aria-label="Framework" />
                  <ComboboxContent>
                    <ComboboxEmpty>None</ComboboxEmpty>
                    <ComboboxItem value="next">Next</ComboboxItem>
                  </ComboboxContent>
                </Combobox>
                <Slider defaultValue={[30]} aria-label="Volume" />
                <Progress value={40} aria-label="Upload" />
                <Toggle aria-label="Bold">B</Toggle>
                <ToggleGroup type="single" defaultValue="left" aria-label="Align">
                  <ToggleGroupItem value="left" aria-label="Left">L</ToggleGroupItem>
                  <ToggleGroupItem value="right" aria-label="Right">R</ToggleGroupItem>
                </ToggleGroup>
              </CardContent>
              <CardFooter>
                <Button>Save</Button>
                <Badge>New</Badge>
                <Kbd>K</Kbd>
                <Spinner />
              </CardFooter>
            </Card>

            <Separator />
            <Alert>
              <AlertTitle>Heads up</AlertTitle>
              <AlertDescription>All good.</AlertDescription>
            </Alert>
            <Avatar>
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <Skeleton class="h-4 w-20" />
            <AspectRatio ratio={16 / 9}>
              <div>16:9</div>
            </AspectRatio>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>INV001</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <Pagination pageCount={5} defaultPage={2}>
              <PaginationContent>
                <PaginationPrevious>Previous</PaginationPrevious>
                <PaginationItems />
                <PaginationNext>Next</PaginationNext>
              </PaginationContent>
            </Pagination>
            <Tabs defaultValue="one">
              <TabsList>
                <TabsTrigger value="one">One</TabsTrigger>
                <TabsTrigger value="two">Two</TabsTrigger>
              </TabsList>
              <TabsContent value="one">First</TabsContent>
              <TabsContent value="two">Second</TabsContent>
            </Tabs>
            <Accordion type="single" collapsible>
              <AccordionItem value="a">
                <AccordionTrigger>Question</AccordionTrigger>
                <AccordionContent>Answer</AccordionContent>
              </AccordionItem>
            </Accordion>
            <Collapsible>
              <CollapsibleTrigger>More</CollapsibleTrigger>
              <CollapsibleContent>Details</CollapsibleContent>
            </Collapsible>

            <Dialog>
              <DialogTrigger as={Button}>Open dialog</DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Dialog</DialogTitle>
                  <DialogDescription>Hello</DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
            <AlertDialog>
              <AlertDialogTrigger as={Button}>Delete</AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sure?</AlertDialogTitle>
                  <AlertDialogDescription>Cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Sheet>
              <SheetTrigger as={Button}>Open sheet</SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Sheet</SheetTitle>
                  <SheetDescription>Side panel</SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>
            <Popover>
              <PopoverTrigger as={Button}>Popover</PopoverTrigger>
              <PopoverContent aria-label="Dimensions">Content</PopoverContent>
            </Popover>
            <HoverCard>
              <HoverCardTrigger href="#">@shadow</HoverCardTrigger>
              <HoverCardContent>Card</HoverCardContent>
            </HoverCard>
            <Tooltip>
              <TooltipTrigger as={Button}>Hover</TooltipTrigger>
              <TooltipContent>Tip</TooltipContent>
            </Tooltip>
            <DropdownMenu>
              <DropdownMenuTrigger as={Button}>Menu</DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Profile</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ContextMenu>
              <ContextMenuTrigger>Right click</ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem>Copy</ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
            <Menubar>
              <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>New</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
            <Command label="Palette">
              <CommandInput placeholder="Search" />
              <CommandList>
                <CommandEmpty>No results</CommandEmpty>
                <CommandItem>Calendar</CommandItem>
              </CommandList>
            </Command>
            <Toaster>
              <ToastButton />
            </Toaster>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
