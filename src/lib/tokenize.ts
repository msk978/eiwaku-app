const TOKEN_RE = /[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*|[^\sA-Za-z0-9]/g;

export function tokenize(raw: string): string[] {
  return raw.match(TOKEN_RE) ?? [];
}

export function isWordToken(token: string): boolean {
  return /[A-Za-z0-9]/.test(token);
}
