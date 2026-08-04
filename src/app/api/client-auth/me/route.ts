import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const jwt = request.cookies.get("client-jwt");

  if (!jwt || jwt.value !== "mock-client-token") {
    return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const user = {
    id: "client-user-1",
    email: "partner@acme.com",
    clientName: "Acme Corporation",
    contactName: "John Smith",
  };

  return NextResponse.json(user);
}
