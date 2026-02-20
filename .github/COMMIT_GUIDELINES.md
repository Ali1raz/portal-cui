# Commit Message Guidelines

## Format

```
(scope): brief description
```

## Scopes

### By Role/Feature Area

- `(student)` - Student-facing features and pages
- `(professor)` - Professor-facing features and pages
- `(hod)` - HOD-facing features and pages
- `(admin)` - Admin-facing features and pages
- `(director)` - Director-facing features and pages
- `(accountant)` - Accountant-facing features and pages
- `(auth)` - Authentication and authorization

### By Technical Area

- `(db)` - Database schema, migrations, seed scripts
- `(api)` - API routes and endpoints
- `(ui)` - UI components (shadcn, custom components)
- `(hooks)` - React hooks
- `(lib)` - Library utilities, helpers
- `(config)` - Configuration files (next.config, tsconfig, etc.)
- `(deps)` - Dependency updates
- `(types)` - TypeScript types and interfaces

### By Feature

- `(announcements)` - Announcement system
- `(attendance)` - Attendance tracking
- `(enrollment)` - Course enrollment
- `(registration)` - Student registration
- `(complaints)` - Complaint management
- `(subjects)` - Subject/course management
- `(leave)` - Leave requests
- `(permissions)` - Permission system

### Special Scopes

- `(fix)` - Bug fixes
- `(perf)` - Performance improvements
- `(refactor)` - Code refactoring without feature changes
- `(docs)` - Documentation only
- `(test)` - Adding or updating tests
- `(chore)` - Build process, tooling, maintenance

## Description Guidelines

1. **Use lowercase** - Start with lowercase letter
2. **Present tense** - Use imperative mood ("add" not "added")
3. **Be concise** - Aim for 50 characters or less
4. **Be specific** - Describe what, not how
5. **No period** - Don't end with a period

## Examples

### Good Commits

```
(student): add announcement details page
(hod): implement complaint assignment workflow
(db): add announcement targeting filters
(auth): integrate better-auth session handling
(ui): create reusable date picker component
(fix): resolve hydration mismatch in theme wrapper
(perf): add unstable_cache to announcement queries
(refactor): extract announcement filters to separate function
```

### Bad Commits

```
(student): Added new feature.  # Don't capitalize, don't use period
(UI): updated some stuff  # Wrong case for scope, too vague
fixed bug  # Missing scope
(student): I implemented the announcement system and added cards with images and also added filtering  # Too long
(student): changes  # Too vague
```

## Multiple Scopes

When changes affect multiple areas, use the primary scope:

```
(student): add announcements page with filters
# Even if this touches db queries and UI components
```

Or combine related scopes:

```
(student/announcements): add hod filtering
```

## Breaking Changes

For breaking changes, add exclamation mark:

```
(api)!: change announcement response structure
```

## Related Work

Reference issues/PRs when applicable:

```
(student): add announcements page (#123)
(fix): resolve attendance calculation (#456)
```

## AI-Generated Commits

When AI assists with commits, ensure messages still follow these guidelines. The AI should:

- Choose the most specific scope
- Focus on user-facing changes for features
- Use technical scope for infrastructure changes
- Keep descriptions concise and clear
