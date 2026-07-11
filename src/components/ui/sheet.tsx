import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Sheet = Dialog.Root;
export const SheetTrigger = Dialog.Trigger;
export const SheetClose = Dialog.Close;
export function SheetContent({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof Dialog.Content>) {
  return <Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out" /><Dialog.Content className={cn("fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col overflow-y-auto border-l bg-background p-5 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right sm:p-6", className)} {...props}>{children}<Dialog.Close className="absolute right-4 top-4 rounded-md border bg-card p-2 text-muted-foreground hover:text-foreground"><X className="size-4" /><span className="sr-only">Close</span></Dialog.Close></Dialog.Content></Dialog.Portal>;
}
export const SheetTitle = Dialog.Title;
export const SheetDescription = Dialog.Description;
