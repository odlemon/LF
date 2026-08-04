import { NextResponse } from "next/server";

export async function POST() {
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
  });

  return response;
}
