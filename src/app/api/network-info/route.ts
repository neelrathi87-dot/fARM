import { NextResponse } from "next/server";
import os from "os";

export const dynamic = "force-dynamic";

export async function GET() {
  let lanIp = "localhost";
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === "IPv4" && !net.internal && !net.address.startsWith("169.254.")) {
        lanIp = net.address;
        break;
      }
    }
  }
  return NextResponse.json({ lanIp, port: 3000, mobileUrl: `http://${lanIp}:3000` });
}
