import { NextResponse, NextRequest } from "next/server";
import axios from "axios";
import { getServerBackendApiBase } from "@/lib/api/baseUrl";

const BACKEND_API_URL = getServerBackendApiBase();

interface BackendPermission {
  name: string;
}

interface BackendRole {
  name: string;
  permissions?: BackendPermission[];
}

export async function GET(request: NextRequest) {
  const jwt = request.cookies.get("jwt");

  if (!jwt || !jwt.value) {
    return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const token = jwt.value;
    
    const userResponse = await axios.get(
      `${BACKEND_API_URL}/v1/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const backendUser = userResponse.data;
    const mappedUser = {
      id: backendUser.uid,
      email: backendUser.email,
      firstName: backendUser.firstName,
      lastName: backendUser.lastName,
      roles: backendUser.roles
        ? (backendUser.roles as BackendRole[]).map((role) => role.name)
        : [],
      permissions: backendUser.roles
        ? (backendUser.roles as BackendRole[]).flatMap((role) =>
            role.permissions ? role.permissions.map((p) => p.name) : []
          )
        : [],
    };

    return NextResponse.json(mappedUser);
  } catch {
    return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
}
