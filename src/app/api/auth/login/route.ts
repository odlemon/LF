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

export async function POST(request: NextRequest) {
  try {
    const credentials = await request.json();
    const loginResponse = await axios.post(`${BACKEND_API_URL}/v1/auth/login`, {
      email: credentials.email,
      password: credentials.password,
    });

    const token = loginResponse.data.token;

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

    const response = NextResponse.json(mappedUser);
    response.cookies.set("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    const errorObj = error as { response?: { status?: number; data?: { message?: string } } };
    const status = errorObj.response?.status || 500;
    const message = errorObj.response?.data?.message || "Authentication failed";
    return new NextResponse(JSON.stringify({ message }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
}
