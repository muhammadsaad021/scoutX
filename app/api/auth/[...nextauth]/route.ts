import { handlers } from "@/auth";

// Expose NextAuth handlers (GET and POST) for /api/auth/* endpoints
export const { GET, POST } = handlers;
