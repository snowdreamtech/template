# Remix / React Router v7 Development Guidelines

> Objective: Define standards for building full-stack React web applications with Remix / React Router v7, covering data loading, mutations, routing, TypeScript integration, performance, and deployment.

## 1. Data Loading (Loaders)

- Use **`loader`** functions exported from route modules for all server-side data fetching. Loaders run only on the server — their return value is serialized and sent to the client, accessed in the route component via `useLoaderData()`.
- Return data using native `Response` objects or `json()` utility. Throw `Response` objects for redirects and early exits:

  ```typescript
  // app/routes/users.$id.tsx
  import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node"; // or react-router

  export async function loader({ params, request }: LoaderFunctionArgs) {
    const session = await getSession(request.headers.get("Cookie"));
    if (!session.userId) throw redirect("/login");

    const user = await db.user.findUnique({ where: { id: params.id } });
    if (!user) throw new Response("Not Found", { status: 404 });

    return json({ user });
  }
  ```

- **Never fetch data inside React components** if it can be fetched in a `loader`. This is the most critical Remix anti-pattern — loaders enable parallel data loading, SSR, and progressive enhancement.
- Use **`typeof loader`** for `useLoaderData()` typing — eliminates manual type annotations:

  ```typescript
  export default function UserProfile() {
    const { user } = useLoaderData<typeof loader>();
    // `user` is fully typed from the loader return
  }
  ```

- Use **`defer()` + `<Suspense>` + `<Await>`** for streaming non-critical slow data, allowing the page shell to render immediately:

  ```typescript
  export async function loader({ params }: LoaderFunctionArgs) {
    // Start slow async operation — don't await
    const statsPromise = fetchUserStats(params.id);  // slow, non-critical
    const user = await fetchUser(params.id);  // fast, critical — await this

    return defer({ user, stats: statsPromise });
  }

  export default function UserPage() {
    const { user, stats } = useLoaderData<typeof loader>();
    return (
      <div>
        <UserHeader user={user} />
        <Suspense fallback={<StatsSkeleton />}>
          <Await resolve={stats}>
            {(data) => <UserStats stats={data} />}
          </Await>
        </Suspense>
      </div>
    );
  }
  ```

## 2. Mutations (Actions)

- Use **`action`** functions for all data mutations (POST, PUT, DELETE, PATCH form submissions). Actions are the preferred replacement for `useState` + manual `fetch()` patterns for form interactions.
- Use Remix's **`<Form>` component** for all form-based mutations. `<Form>` works without JavaScript (progressive enhancement out of the box):

  ```typescript
  export async function action({ request, params }: ActionFunctionArgs) {
    const formData = await request.formData();

    // Validate server-side with Zod
    const result = UpdateUserSchema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return json(
        { errors: result.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    await db.user.update({ where: { id: params.id }, data: result.data });
    return redirect(`/users/${params.id}`);
  }

  export default function EditUser() {
    const actionData = useActionData<typeof action>();

    return (
      <Form method="post">
        <input name="name" />
        {actionData?.errors?.name && <span>{actionData.errors.name[0]}</span>}
        <button type="submit">Save</button>
      </Form>
    );
  }
  ```

- After an action completes, Remix **automatically re-validates and re-runs loaders** on affected routes. Never manually refetch — rely on Remix's invalidation engine.
- Use **`useFetcher()`** for optimistic UI updates and non-navigating mutations (inline toggles, auto-saving, loading more items):

  ```typescript
  function LikeButton({ postId, liked }: { postId: string; liked: boolean }) {
    const fetcher = useFetcher();
    const isLiked = fetcher.formData
      ? fetcher.formData.get("liked") === "true"  // optimistic
      : liked;                                      // server state

    return (
      <fetcher.Form method="post" action={`/posts/${postId}/like`}>
        <input type="hidden" name="liked" value={String(!isLiked)} />
        <button type="submit">{isLiked ? "❤️" : "🤍"}</button>
      </fetcher.Form>
    );
  }
  ```

## 3. Routing & File Structure

### File-Based Routing

- Remix and React Router v7 use **file-based routing** in `app/routes/`. Use dot notation for route nesting:

  ```text
  app/
  ├── root.tsx                    # Root layout (renders <Outlet />)
  ├── routes/
  │   ├── _index.tsx              # / (index route)
  │   ├── users.tsx               # /users (layout with <Outlet />)
  │   ├── users._index.tsx        # /users (index)
  │   ├── users.$id.tsx           # /users/:id
  │   ├── users.$id.edit.tsx      # /users/:id/edit
  │   ├── auth.login.tsx          # /auth/login (no shared layout with /auth)
  │   └── _auth.signup.tsx        # Pathless layout route (prefixed with _)
  └── components/                 # Shared components
  ```

- Use **Nested Routes** for shared layouts. Parent routes render `<Outlet />` where child routes appear. Nested routes share data loading in parallel — both parent and child loaders run simultaneously.
- Use **`handle`** exports for route-level metadata accessible to parent layouts:

  ```typescript
  export const handle = { breadcrumb: "User Settings" };
  // In root layout:
  const matches = useMatches();
  const breadcrumbs = matches.filter((m) => m.handle?.breadcrumb);
  ```

- Use **`ErrorBoundary`** exports on route modules to catch loader/action errors:

  ```typescript
  export function ErrorBoundary() {
    const error = useRouteError();
    if (isRouteErrorResponse(error)) {
      return <div>HTTP {error.status}: {error.data}</div>;
    }
    return <div>Unexpected error: {error.message}</div>;
  }
  ```

## 4. TypeScript & Validation

- Use **Zod** for all action payload and loader param validation:

  ```typescript
  const UpdateUserSchema = z.object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
    role: z.enum(["admin", "viewer"]),
  });

  type UpdateUser = z.infer<typeof UpdateUserSchema>;
  ```

- Route params are always strings — validate and coerce before use:

  ```typescript
  const id = z.string().uuid().safeParse(params.id);
  if (!id.success) throw new Response("Invalid ID", { status: 400 });
  ```

- Use `invariant` (or native `if (!condition) throw`) for defensive param validation in loaders.

## 5. Performance & Deployment

### Prefetching

- Use **`<Link prefetch="intent">`** to preload route data and assets when the user hovers or focuses a link — reduces perceived navigation latency to near-zero:

  ```typescript
  <Link to={`/users/${user.id}`} prefetch="intent">
    {user.name}
  </Link>
  ```

  Use `prefetch="render"` for links that are very likely to be clicked.

### Revalidation Control

- Use **`shouldRevalidate`** to skip unnecessary loader re-runs:

  ```typescript
  export function shouldRevalidate({ actionResult, currentUrl, nextUrl }: ShouldRevalidateFunctionArgs) {
    // Only revalidate if navigating to a different user
    return currentUrl.pathname !== nextUrl.pathname;
  }
  ```

### SEO & Metadata

- Use the **`meta`** export for per-page SEO metadata (runs on server during SSR):

  ```typescript
  export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: `${data?.user.name} — MyApp` }, { name: "description", content: `Profile page for ${data?.user.name}` }];
  ```

### Testing & Deployment

- Write unit tests for loaders and actions (call them directly as async functions with mock `Request`/`params`).
- Use **Playwright** or **Cypress** for E2E tests covering route transitions, form submissions, error boundaries, and progressive enhancement.
- Deploy on: Fly.io, Vercel, Cloudflare Workers, or any Node.js server with the appropriate adapter. Keep adapter dependencies updated with the framework version.
