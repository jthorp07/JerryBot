export function cap(s: string): string {
  if (s.toLowerCase() === "kay/o") return "KAY/O";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export function equalsIgnoreCase(a: string, b: string): boolean {
  return String(a || "").toLowerCase() === String(b || "").toLowerCase();
}
