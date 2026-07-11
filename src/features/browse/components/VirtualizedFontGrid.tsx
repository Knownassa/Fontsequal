import { useMemo, useState } from "react";
import type { FontFamily } from "@/types/font";
import { Button } from "@/components/ui/button";
import { FontGrid } from "./FontGrid";
type Props = Omit<React.ComponentProps<typeof FontGrid>, "fonts"> & { fonts: FontFamily[] };
export function VirtualizedFontGrid({ fonts, ...props }: Props) { const [count, setCount] = useState(60); const visible = useMemo(() => fonts.slice(0, count), [count, fonts]); return <div className="space-y-4"><FontGrid {...props} fonts={visible} />{fonts.length > visible.length ? <Button className="w-full" variant="glass" onClick={() => setCount((value) => value + 60)}>Load {Math.min(60, fonts.length - visible.length)} more</Button> : null}</div>; }
