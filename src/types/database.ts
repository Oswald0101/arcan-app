// src/types/database.ts
// Type stub pour le client Supabase typé
// En production : remplacer par `npx supabase gen types typescript --local > src/types/database.ts`

export type Database = {
  public: {
    Tables: Record<string, unknown>
    Views: Record<string, unknown>
    Functions: Record<string, unknown>
    Enums: Record<string, unknown>
  }
}
