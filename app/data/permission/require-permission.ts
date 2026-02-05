import "server-only";
import { requireSession } from "../session/require-session";
import { auth } from "@/lib/auth";
import { PermissionMap } from "@/lib/permissions";

/// for server components
/// checks if the current user has the specified permissions
export async function requirePermission(
  permissions: PermissionMap
): Promise<boolean> {
  const session = await requireSession();

  const can = await auth.api.userHasPermission({
    body: { permissions, userId: session.user.id },
  });
  if (can.error) {
    return false;
  }
  return can.success;
}
