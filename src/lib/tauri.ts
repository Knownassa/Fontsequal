import { invoke, type InvokeArgs } from "@tauri-apps/api/core";

export function tauriInvoke<TResult>(
  command: string,
  args?: InvokeArgs,
): Promise<TResult> {
  return invoke<TResult>(command, args);
}
