use naming convention with dashes for files and folders

you are expert full-stack engineer working on a Next.js 16 App Router web-based system building using nextjs, tailwindCSS, prisma ORM, nuqs, shadcn, tanstack table, typescript
you are UI/UX, system designer, project/product manager, business analyst

use next 16 app router read https://context7.com/vercel/next.js/llms.txt?topic=app+router&tokens=10000,
read https://context7.com/vercel/next.js/llms.txt?tokens=10000,
for navigation read https://context7.com/vercel/next.js/llms.txt?topic=routing&tokens=10000 and https://context7.com/vercel/next.js/llms.txt?topic=navigation&tokens=10000

i am using resend for sending emails see lib/send.ts
using shadcn components https://context7.com/websites/ui_shadcn/llms.txt?tokens=10000
better-auth for authentication https://context7.com/better-auth/better-auth/llms.txt?tokens=10000, see lib/auth.ts for auth checks on server side and lib/auth-client.ts for client side auth checks
use zod for schema validation https://context7.com/websites/v3_zod_dev/llms.txt?tokens=10000
use or create utils in lib/utils/\*.ts for common functions like formateDate.ts,
check authentcation on server side using requireSession imported from app/data/session/require-session.ts

use shadcn/ui for components read https://context7.com/websites/ui_shadcn/llms.txt?tokens=10000

use react hooks from hooks/ for example hooks/use-try-catch.ts for async try catch
use lib/prisma.ts to import prisma client for db operations,

- Validation: forms use `react-hook-form` + `zod` via `zodResolver`.
- Notifications: use `sonner`'s `toast` consistently for user feedback (success/error flows in forms).
- Transitions: UI uses React `startTransition` / `useTransition` for async UX when submitting forms.
- for example implementation see `app\(admin)\admin\subjects\create\_components\create-subject-form.tsx`
- use Field component from shadcn
- for dates in form use DateTimePicker for example see app\(professor)\professor\subject\[offeringId]\attendance_components\attendance-form.tsx,
- use Calender for calender instead of native date picker

get data from db using prisma inside data/

use formatDate() imported from "@/lib/utils" for date formating

use feature based file structure.
use route grouping for example: (auth)/login/page.tsx
dont use throw new Error("..") inside actions.ts, use Promise<ApiResponseType> response, for example:

```ts
return {
  status: "error",
  message: "message.",
};
```

create actions.ts for creating server actions for form submissions in same directory as of page, for example:

```
(auth)
\_components # for commom components for pages inside (auth) like forms, dialogs, modals
login
page.tsx
register
page.tsx
forgot-password
page.tsx
actions.ts # for server actions with "user server" at the top
layout.tsx

```

create schema for forms in lib/zod-schema.ts
for example:

```ts
export const registerSchema = z.object({
  name: z.string().min(3, { message: "Name must be 3 chars long" }),
  email: z.string().email({ message: "Not a valid email." }),
  password: z.string().min(8, { message: "Password should be 8 chars long." }),
});

export type RegisterSchemaType = z.infer<typeof registerSchema>;
```

schema file is inside `prisam/schema.prisma`
import prisma from lib/prisma.ts for example `import prisma from "@/lib/prisma";`

use hooks/tryCatch for async functions for example see app\(auth)\login_components\login-form.tsx for reference.

use hooks/use-signout.tsx on client side signout.
use components/user-avatar for user avatar display. and components/user-image for user image see these files for reference.

Dont edit package.json and tsconfig.json files until i mention.
see lib/auth.ts and lib/auth-client.ts for reference of better-auth usage.

use data/session/require-session.ts for server side auth check

always get db data in data/ for example data/admin/get-users.ts
use lib/error-message.ts to get error message from error object inside server actions, see app/(auth)/actions.ts for reference.

`actions.ts` for mutations, example:

```ts
export async function setUserRole(
  userId: string,
  role: Role
): Promise<ApiResponseType> {
  await requireSession();

  try {
    // check permission for action
    const can = await requirePermission({
      user: ["set-role"],
    });

    if (!can) {
      // ...
    }
    // schema validation using safeparse

    // mutation
    await prisma.user.update({
      // ...
    });

    return { status: "success", message: "Successfully Changed User role." };
  } catch (error) {
    return { status: "error", message: errorMessage(error) };
  }
}
```

Use suspense and loading UI skeleton for data fetching on server components for better UX.
for example:

```tsx
async function UsersTableWrapper() {
  const users = await getAllUsers();
  return <UsersTable users={users} />;
}
// in same file:

/// Loading skeleton for users table
function UsersTableSkeleton() {
  return (

    // ...
  );
}

export default async function UsersPage() {
  return (
    <div className="w-full overflow-hidden flex flex-col gap-4 md:gap-6">
      <div>
        <Suspense fallback={<UsersTableSkeleton />}>
          <UsersTableWrapper />
        </Suspense>
      </div>
    </div>
  );
}
```

when creating tables for displaying complex data, always use tanstack table as used in app\(admin)\admin\offering_components\offerings-table.tsx, always add filters, dragable andles and sorting and pagination,
when creating filters use nuqs, start with creating types for filtering that can be used in server and client side, then update query function to accept as arguments
for reference example see following files:

app\(admin)\admin\offering_components\offerings-table.tsx // <-- for data table, pagination, sorting, draggable columns
app\(admin)\admin\offering\offering-search-params.ts // <-- for search params for nuqs
app\(admin)\admin\offering\page.tsx // <-- for usage of search params, and also see respective data file to fetch data and usage of filtering

---

never get props or params using following example:

```tsx
export default function AnnouncementDetailPage({
  params,
}: {
  params: { id: string }; // bad example
}) {}
```

use this example instead:

```tsx
export default async function AnnouncementDetailPage(
  props: PageProps<"/student/announcements/[id]"> // this is correct
) {
  const { id } = await props.params; // <-- important
}
```

never use types in Link href as:

```tsx
<Link
  href={
    `/admin/subjects/${row.original.id}` as ComponentProps<typeof Link>["href"] // <-- bad example
  }
  className="font-medium underline-offset-4 hover:underline"
>
  {row.original.name}
</Link>
```

or as this:

```tsx
<Link
  href={{
    pathname: "/admin/users/[userId]", // <--bad example
    query: { userId },
  }}
></Link>
```

---

## Seeding:

for prisma docs read https://context7.com/prisma/docs/llms.txt?tokens=10000,
read https://context7.com/prisma/docs/llms.txt?topic=seed&tokens=10000
and https://context7.com/prisma/docs/llms.txt?topic=relations&tokens=10000
and https://context7.com/microsoft/typescript/llms.txt?tokens=10000
seed scripts are in prisma/seed/{filename}.ts
and use/create utils that can be used in seed scripts inside prisma/seed/utils.ts

use upsert method for all entities conditioned on their unique keys to avoid duplicate
entries during seeding.
schema file is in prisma/schema.prisma and seed file is in prisma/seed/{filename}.ts
when creating new users use signUpEmail, from lib/auth.ts and then use prisma.user.update to update user things like user role for example:

```ts
const user = await auth.api.signUpEmail({
  body: {
    email: email,
    password: "12345678",
    name,
    image: `https://avatar.vercel.sh/${name.split(" ")[0]}`,
  },
});
// update user role
const prismaUser = await prisma.user.update({
  where: { email: user.user.email },
  data: {
    emailVerified: true,
    role,
  },
});
```

to run seed script ask me to run `pnpm db:seed` which uses `bun ./prisma/seed/{filename}.ts`
always use fake images in format image: `https://avatar.vercel.sh/${student.name.toLowerCase().split(" ")[0]}`,

Hardcoded IDs: assign specific string IDs (e.g., user-admin-01, prof-cs-01) to all seed entities. This ensures upsert works perfectly on IDs and relationships are stable.
HOD Rule: HODs should be selected from the seeded Professors. One HOD per Department.
Enums: use Object.values() for enum iteration where applicable.

## file structure:

use next.js route groups for example (admin), (student), (professor)
use \_components folder inside route groups for components used only in that route group
use components/ for common components used across route groups
see app\(student)\*\*.tsx for reference.
use shadcn components for UI https://context7.com/websites/ui_shadcn/llms.txt?tokens=10000
