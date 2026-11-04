# Down The Hall — UI / UX TODO

Goal: make the app feel like *Down The Hall* instead of a generic dashboard, and
make the mobile experience first-class.

Verify changes with:

```bash
npm run typecheck
npm run lint
npm run build
```

Sections are ordered by impact. Section 1 is the "mobile foundation" pass and
should land first — it is mostly small, low-risk edits. Section 2 is the
identity work that makes the app memorable.

---

## 1. Mobile foundation (do first)

- [X] **Fixed `mx-16` page gutter crushes mobile.**
      `components/shared/Page.tsx` applies `mx-16` on every breakpoint, leaving
      ~262px of content on a 390px phone. Change to
      `mx-4 sm:mx-8 lg:mx-16` (or use `px-*` with a max-width container).
      Audit routes for their own duplicate wrappers while you are there.

- [ ] **Navbar padding is desktop-only.**
      `components/nav/NavBar.tsx:34` uses `px-16 py-4`. Use
      `px-4 sm:px-6 lg:px-16` and keep the bar sticky with a backdrop blur
      (`sticky top-0 bg-navbar/90 backdrop-blur`). Add `pb-[env(safe-area-inset-bottom)]`
      where relevant.

- [ ] **Replace the mobile hamburger drawer with a bottom tab bar.**
      Home / Find / Track / Stats / Goals as 44px+ targets with an active state
      (use `usePathname`). Move Users + Settings into a "More" sheet or the
      desktop menu. Keep the drawer for `lg` and up.
      File: `components/nav/NavBar.tsx`.

- [ ] **Nav items have no active state and inconsistent sizing.**
      Drawer buttons mix `text-lg` and `text-xl` (`NavBar.tsx:102-159`), and
      "Track" is the only one that differs. Unify and highlight the current
      route. Replace the bare `X` close button with an icon and a label.

- [ ] **Reorder the home page for mobile.**
      In `components/home/CentralDisplay.tsx` the order is Currently Reading →
      Goals → Feed, so goals push the feed below the fold. Make it Currently
      Reading → Feed → Goals on small screens (grid `order-*` classes).

- [ ] **Move book actions behind a bottom sheet.**
      `components/shared/BookListItem.tsx` renders Edit / Delete / star rating
      inline on every row. On mobile, collapse secondary actions into a single
      "⋯" trigger that opens a sheet: change status, rate, edit, delete.
      Keeps the desktop row as-is.
      Also: `handleDelete` has a `// wrap in an AlertDialog confirm` comment —
      deleting a book with no confirmation is a real footgun on touch.

- [ ] **Track view is desktop-shaped.**
      `components/track/Track.tsx`:
      - Filter dropdown is `w-72` — make it full width on mobile.
      - View/sort selection is local state and resets on reload/navigation;
        persist it in the URL like `status`/`order`/`page`.
      - The 4th view ("CrazyView") reuses `CardIcon` — give it its own icon.
      - Unselected status tabs are `text-white` on `bg-card` (`#d1d5db`) and
        are nearly invisible. Fix the contrast and use one segmented style.
      - Pagination controls repeat "Previous/Next" text buttons that are small
        on touch; collapse page numbers to a `1 / 12` control on mobile.

- [ ] **List view is unusable on mobile.**
      `components/track/_BookListView.tsx` is a data table with
      `border-4 border-black` and `text-2xl` headers. Either hide the view under
      `md`, or transform rows into compact cards with the column selector moved
      into a sheet.

- [ ] **Find search needs mobile affordances.**
      `components/find/Find.tsx` requires 4+ characters and has no icon or clear
      button. Add a sticky search field with a search icon and clear button,
      lower the minimum to 2, and add recent searches (localStorage) plus genre
      chips for zero-typing discovery.

- [ ] **Touch targets and safe areas.**
      Audit interactive elements under 44px (icon buttons in `Track`,
      `_BookListView` checkboxes, `_Notes` controls). Add
      `viewport-fit=cover` and a `<meta name="theme-color">` matching the
      navbar.

---

## 2. Identity — lean into the name

- [ ] **Warm the palette.**
      `#F4F4F9` reads cold/gray. Move to a cream/paper background with an ink
      navbar and keep green/orange as spine accents. Define the palette in
      `app/globals.css` as HSL variables and reference them from
      `tailwind.config.ts` instead of hardcoded hex, so opacity modifiers and
      theming work.

- [ ] **Serif display type.**
      Keep Inter for UI text; add one serif (e.g. `Fraunces` or `Literata`) via
      `next/font` for headings, the wordmark, and book titles. Trim the font
      weights actually used.

- [ ] **Make the shelf view the signature view.**
      `components/track/_BookShelfView.tsx` is currently just a cover image.
      Build a real shelf: covers standing on a shelf line, spines with rotated
      title/author text, subtle shadow/depth, and a tap/hover "pull out" state.
      This is the thing people will screenshot; make it the default view on
      mobile.

- [ ] **Library-card motif for Currently Reading.**
      `components/home/_CurrentlyReadingCard.tsx` — style it as a checkout card
      with a date-due stamp and a progress line for pages read. Reinforces the
      brand without new data.

- [ ] **Page-turn transition.**
      `app/template.tsx` currently does a 750ms fade on every navigation, which
      feels slow. Try a short page-turn (perspective + rotateY on the cover) or
      a faster, directional slide; respect `prefers-reduced-motion`.

- [ ] **Cover-forward layout on mobile.**
      A 2-column cover grid reads more like a book app than cover + two lines +
      rating + buttons. Use it as the mobile default for Track and search
      results.

- [ ] **Cover-derived accent color.**
      Compute an average color from the cover (client-side, cache it) and use it
      for the detail-page gradient and rating highlights. Cheap and makes each
      book feel distinct.

- [ ] **Finish-book moment.**
      On "Finished", add a stamp/flip animation and a toast that links to the
      activity entry that already gets written. This is the emotional core of a
      tracking app; make it feel like something happened.

---

## 3. Polish and correctness

- [ ] **Dark mode is dead code.**
      `.dark` variables exist in `app/globals.css` but `tailwind.config.ts`
      hardcodes hex colors, so the class never applies. Either remove the dead
      variables or finish the HSL-variable migration and add a system/light/dark
      toggle in the navbar. Night reading is a real mobile use case.

- [ ] **`text-card-foreground` is undefined.**
      `tailwind.config.ts` defines `card` but not `card-foreground`, so
      `components/ui/card.tsx` and others reference a class that does not
      generate. Add it (or point at `foreground`).

- [ ] **Skeleton loaders.**
      `app/loading.tsx` is generic. Add layout-shaped skeletons for Home, Track,
      and the book detail page so navigation does not flash empty.

- [ ] **Empty and error states.**
      `_TrendingDisplay` has a good empty state; most other surfaces do not
      (Track, Goals, Users, Notes). Standardise on one empty-state component
      with an icon, one line of copy, and one action.

- [ ] **Pull-to-refresh.**
      Add pull-to-refresh on Home and Track on touch devices (and keep the
      existing "Try again" button as a fallback).

- [ ] **Consistent book components.**
      `_BookCardView` just wraps `BookListItem`, while `_BookShelfView` and
      `_BookListView` render their own covers and links. Consolidate on
      `BookCover` + one row/grid primitive so hover, focus, and tap states match
      everywhere.

- [ ] **Settings page polish.**
      `app/settings/page.tsx` is the place to surface the theme toggle, Hardcover
      connection status, and sign-out; check it is usable at 390px.

---

## Quick wins, if you only have an hour

1. Responsive `Page` / navbar padding.
2. Sticky navbar + bottom tab bar.
3. Track tab contrast + URL-persisted view.
4. Hide the list/table view under `md`.
5. Reorder home on mobile.
