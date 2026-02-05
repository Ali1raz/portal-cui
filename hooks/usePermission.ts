import { authClient } from "@/lib/auth-client";
import { Role } from "@/lib/generated/prisma/enums";
import { PermissionMap } from "@/lib/permissions";

/// for client components
export function usePermission(permissions: PermissionMap): boolean {
  const { data: session } = authClient.useSession();

  if (!session || !session.user) {
    return false;
  }

  console.log(`Checking permissions for role:`, session.user.role);

  const can = authClient.admin.checkRolePermission({
    permissions,
    role: session?.user.role as Role,
  });

  return can;
}
