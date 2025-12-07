use es modules
use react 19
use naming convention with dashes for files and folders
use typescript

i am using resend for sending emails see lib/send.ts
using shadcn components https://context7.com/websites/ui_shadcn/llms.txt?tokens=10000
better-auth for authentication https://context7.com/better-auth/better-auth/llms.txt?tokens=10000, see lib/auth.ts for auth checks on server side and lib/auth-client.ts for client side auth checks
use zod for schema validation https://context7.com/websites/v3_zod_dev/llms.txt?tokens=10000
use or create utils in lib/utils/\*.ts for common functions like formateDate.ts,
check authentcation on server side using requireSession imported from app/data/session/require-session.ts

get data from db using prisma inside data/
add check on admin routes for admin role using requireAdmin() imported from app/data/admin/require-admin.ts

use feature based file structure.
use route grouping for example: (auth)/login/page.tsx
create actions.ts for creating server actions for form submissions in same directory as of page, for example:

```
(auth)
  _components # for commom components for pages inside (auth) like forms, dialogs, modals
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
import prisma from lib/prisma.ts

use hooks/tryCatch for async functions for example see app\(auth)\login_components\login-form.tsx for reference.

use hooks/use-signout.tsx on client side signout.
use components/user-avatar for user avatar display. and components/user-image for user image see these files for reference.

Dont edit package.json and tsconfig.json files until i mention.
see lib/auth.ts and lib/auth-client.ts for reference of better-auth usage.

use data/session/require-session.ts for server side auth check and
data/admin/require-admin.ts for admin role check on server side.
always get db data in data/ for example data/admin/get-users.ts
use lib/error-message.ts to get error message from error object inside server actions, see app/(auth)/actions.ts for reference.
