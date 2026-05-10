import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatIdTamu = (id: number | string | undefined) => {
  if (!id) return "-";
  const cleanId = String(id).replace("PKC-", "").replace(/^0+/, "");
  return `PKC-${cleanId}`;
};