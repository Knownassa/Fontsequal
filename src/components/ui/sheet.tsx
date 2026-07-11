import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Sheet = Dialog.Root;
export const SheetTrigger = Dialog.Trigger;
export const SheetClose = Dialog.Close;
export function SheetContent({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof Dialog.Content>) {
  return <Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out" /><Dialog.Content className={cn("fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col overflow-y-auto border-l border-white/10 bg-[#0d0e14] p-5 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right sm:p-6", className)} {...props}>{children}<Dialog.Close className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/[0.05] p-2 text-white/70 hover:text-white"><X className="size-4" /><span className="sr-only">Close</span></Dialog.Close></Dialog.Content></Dialog.Portal>;
}
export const SheetTitle = Dialog.Title;
export const SheetDescription = Dialog.Description;
