declare namespace Deno {
  interface Env {
    get(name: string): string | undefined;
  }

  const env: Env;
}

declare module "https://deno.land/std@0.210.0/http/server.ts" {
  export function serve(
    handler: (req: Request) => Response | Promise<Response>
  ): void;
}

declare module "https://esm.sh/@supabase/supabase-js@2.33.0" {
  export function createClient(url: string, key: string, options?: any): any;
}
