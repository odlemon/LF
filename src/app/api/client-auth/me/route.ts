import { NextResponse, NextRequest } from "next/server";
import { isMockClientAuthAllowed } from "@/lib/api/baseUrl";

export async function GET(request: NextRequest) {
  if (!isMockClientAuthAllowed()) {
    return NextResponse.json(
      { message: "Client auth mock is disabled." },
      { status: 403 }
    );
  }

  const jwt = request.cookies.get("client-jwt");

  if (!jwt || jwt.value !== "mock-client-token") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = {
    id: "client-user-1",
    email: "partner@acme.com",
    clientName: "Acme Corporation",
    contactName: "John Smith",
  };

  return NextResponse.json(user);
}
