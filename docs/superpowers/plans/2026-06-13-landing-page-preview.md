# Landing Page Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add preview capability to landing page dialog — admin paste HTML, click Preview, see raw HTML in new tab before saving.

**Architecture:** Route handler at `/admin/landing/preview/route.ts` accepts base64-encoded HTML via query param, decodes and serves as raw HTML (requireAdmin). Dialog modified to encode HTML state to base64 and open preview in new tab. Stateless, no database, no session.

**Tech Stack:** Next.js 16 (App Router) + TypeScript + native `btoa`/`atob` (base64) + `encodeURIComponent`.

---

## File Structure

- Create: `src/app/(admin)/admin/landing/preview/route.ts` — GET handler, decode base64 HTML, serve raw
- Modify: `src/app/(admin)/admin/landing/LandingDialog.tsx` — add Preview button, encode HTML, open new tab

---

### Task 1: Route Handler `/admin/landing/preview/route.ts`

**Files:**
- Create: `src/app/(admin)/admin/landing/preview/route.ts`

- [ ] **Step 1: Write route handler**

```typescript
import { requireAdmin } from '@/lib/auth/requireAdmin'

export async function GET(req: Request) {
  await requireAdmin()

  const { searchParams } = new URL(req.url)
  const html = searchParams.get('html')

  if (!html) {
    return new Response('Missing html parameter', { status: 400 })
  }

  let decodedHtml: string
  try {
    decodedHtml = atob(html)
  } catch (err) {
    return new Response('Invalid base64 encoding', { status: 400 })
  }

  return new Response(decodedHtml, {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  })
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: PASS (no errors in this file)

- [ ] **Step 3: Manual smoke test (dev)**

Run: `pnpm dev` in one terminal.

In another terminal, encode a simple HTML to base64 and test the route:

```bash
# Create simple HTML and encode to base64
HTML_STR='<h1>Hello Preview</h1>'
ENCODED=$(node -e "console.log(Buffer.from('$HTML_STR').toString('base64'))")
echo "Encoded: $ENCODED"

# Test route (replace <encoded> with actual value)
curl -s "http://localhost:3000/admin/landing/preview?html=$ENCODED" | head -1
```

Expected: Route returns `<h1>Hello Preview</h1>` (or error 403 if not logged in as admin, which is correct).

If you can't easily curl from terminal, visit the route in browser:
- Log in as admin first
- Visit `http://localhost:3000/admin/landing/preview?html=<base64>` (using small test HTML)
- Confirm HTML renders

- [ ] **Step 4: Commit**

```bash
git add "src/app/(admin)/admin/landing/preview/route.ts"
git commit -m "feat: route /admin/landing/preview serve HTML dari base64 param"
```

---

### Task 2: Add Preview Button to LandingDialog

**Files:**
- Modify: `src/app/(admin)/admin/landing/LandingDialog.tsx`

- [ ] **Step 1: Add Preview button + handler function**

Find the footer buttons section in `LandingDialog.tsx` (around line 105-112 where you see `<div className="flex justify-end gap-2">`). Add this function inside the component before the return:

```typescript
function handlePreview() {
  if (!html.trim()) return
  const encoded = btoa(html)
  const encodedSafe = encodeURIComponent(encoded)
  window.open(`/admin/landing/preview?html=${encodedSafe}`, '_blank')
}
```

Then in the button footer (inside `<div className="flex justify-end gap-2">`), add this button BEFORE the "Simpan" button:

```tsx
<Button
  type="button"
  variant="secondary"
  size="sm"
  onClick={handlePreview}
  disabled={!html.trim() || isPending}
>
  Preview
</Button>
```

So the button order is: [Batal] [Preview] [Simpan]

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: PASS (no errors)

- [ ] **Step 3: Manual test (dev)**

Run: `pnpm dev`, navigate to `/admin/landing`:
1. Click "+ Tambah"
2. In the dialog, paste some HTML (or just type `<h1>Test</h1>`)
3. Click "Preview" button
4. New tab opens showing the HTML rendered
5. Confirm it looks like raw HTML (no admin chrome)
6. Close preview tab, return to form — HTML is still there (form state preserved)
7. Edit HTML in textarea, click Preview again
8. Confirm new preview shows updated HTML

Expected: Preview works, form stays open, can iterate edit→preview→edit.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(admin)/admin/landing/LandingDialog.tsx"
git commit -m "feat: tombol Preview di LandingDialog buat preview HTML"
```

---

## Self-Review

**Spec coverage:**
- Route handler `/admin/landing/preview` ✓ (Task 1)
- Require admin ✓ (Task 1, `requireAdmin()`)
- Query param `?html=base64` ✓ (Task 1)
- Decode base64 → serve raw HTML ✓ (Task 1, `atob()`)
- Button Preview di dialog ✓ (Task 2)
- OnClick: encode to base64 → open new tab ✓ (Task 2, `btoa()` + `window.open`)
- Form state preserved after preview ✓ (Task 2, open in `_blank`)
- Button disabled when HTML empty ✓ (Task 2, `disabled={!html.trim()}`)

**Placeholder scan:** No "TBD", "TODO", or incomplete sections. All code blocks complete.

**Type consistency:** `html` state (string) → `btoa(html)` (string) → `encodeURIComponent(encoded)` (string) → URL param. `atob(html)` in route reverses. Consistent.

**No gaps:** Both tasks are complete, both commit at end.
