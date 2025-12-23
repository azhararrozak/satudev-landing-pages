import { auth } from "@/lib/backend/auth";
import { toNextJsHandler } from "better-auth/next-js";
//import { NextRequest } from "next/server";

export const { GET, POST } = toNextJsHandler(auth);

// export const POST = async (req: NextRequest) => {
//     const res = await auth.handler(req);
//     return res;
// };
