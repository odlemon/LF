import { NextResponse } from "next/server";
import { isMockClientAuthAllowed } from "@/lib/api/baseUrl";

export async function POST() {
  if (!isMockClientAuthAllowed()) {
    return NextResponse.json(
      { message: "Client auth mock is disabled. Use portal invite login." },
      { status: 403 }
    );
  }

  const user = {
    id: "client-user-1",
    email: "partner@acme.com",
    clientName: "Acme Corporation",
    contactName: "John Smith",
  };

  const response = NextResponse.json(user);
  response.cookies.set("client-jwt", "mock-client-token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60,
  });

  return response;
}
