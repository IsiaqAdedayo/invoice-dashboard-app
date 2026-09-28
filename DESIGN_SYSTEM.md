# Payvance Design System Prompt

## Core aesthetic
**Premium fintech dashboard** — dark sidebar with crisp white content area.  
Think **Linear meets Stripe**: high information density, clean typography, razor-sharp interactions.

---

## Fonts
- **Display / UI:** `Sora` — geometric, modern, distinctive. Great for headings and UI text.
- **Numbers / Codes:** `IBM Plex Mono` — used for all monetary amounts, invoice IDs, and any monospace data.

---

## Color palette

| Role | Color | Hex |
|---|---|---|
| Sidebar bg | Deep navy-black | `#0F1117` |
| Sidebar border | Dark | `#1E2230` |
| Sidebar text | Muted | `#8B92A5` |
| Page bg | Light gray | `#F6F7FB` |
| Card bg | White | `#FFFFFF` |
| Card border | Subtle | `#E8EBF0` |
| Primary | Indigo | `#6366F1` |
| Primary hover | Darker indigo | `#4F46E5` |
| Success | Emerald | `#10B981` |
| Warning | Amber | `#F59E0B` |
| Danger | Red | `#EF4444` |
| Text primary | Near black | `#0F1117` |
| Text secondary | Gray | `#6B7280` |
| Text hint | Light gray | `#9CA3AF` |

---

## UI stack + usage rules

| Tool | Use for |
|---|---|
| `styled-components` | Component shells, custom layout, themed primitives |
| `Tailwind` | Spacing utilities, responsive breakpoints |
| `Ant Design` | Heavy components: Table, Modal, Input, DatePicker, Select |
| `Framer Motion` | Page transitions (`opacity 0→1, y 8→0`), button hover (`scale 1.02`), modals (`scale 0.95→1`) |
| `Recharts` | All charts (AreaChart, BarChart, LineChart, PieChart) |
| `Formik + Yup` | All forms |
| `React Query` | All API calls |

---

## Typography scale

```
Page title: 20px / 700 / letter-spacing -0.3px
Card title: 14px / 600
Body: 14px / 400
Small label: 12px / 600 / uppercase / letter-spacing 0.4px
Hint: 12px / 400 / color textHint
Mono amounts: IBM Plex Mono / 600
Invoice IDs: IBM Plex Mono / 500 / color textSecondary
```

---

## Component patterns

### Stat card
```tsx
<StatCard label="Total revenue" value="₦4.2M" delta="12.4%" deltaType="positive" icon="💰" />
```
- White bg, `border-radius: 14px`, 1px border
- Circular blurred accent glow in top-right corner
- Staggered entrance animation with delay

### Status badge
```tsx
<StatusBadge status="paid" />   // emerald
<StatusBadge status="pending" /> // amber
<StatusBadge status="overdue" /> // red
<StatusBadge status="refunded" /> // gray
```
- Dot + label, `font-family: IBM Plex Mono`
- `border-radius: 9999px`

### Buttons
```
Primary: indigo bg, white text, indigo shadow
Secondary/outline: border + transparent bg
Danger: red text, red border, red hover bg
Action (small table btn): 28px height, 10px side padding
```

---

## Layout rules

### Sidebar
- `220px` wide, fixed position, `#0F1117` bg
- Subtle radial gradient glow accents (purple top, green bottom)
- Nav items: active = indigo left border (3px) + `rgba(indigo, 0.12)` bg
- User card at bottom with avatar + name + role

### Topbar
- `58px` tall, white, `1px border-bottom`
- Breadcrumb left, role pill + notifications + avatar right
- Role pill: colored chip showing admin (indigo) or customer (emerald)

### Content
- `padding: 24px` desktop, `16px` mobile
- `margin-left: 220px` (follows sidebar)
- Page transition: `opacity 0→1, y: 8→0, duration: 0.25s`

---

## Admin vs Customer

**Admin sees:**
- Revenue/collection stats, overdue count
- Full invoice table with sortable columns + filters + bulk selection
- Customers page with payment rate progress bars
- Analytics with 5+ chart types

**Customer sees:**
- Their own billing stats only
- Card-based invoice grid (not table) — mobile friendly
- "Action required" section separates pending from paid history
- Pay modal with animated confirm flow

---

## Key interaction patterns

```
Modal open: scale(0.95) → scale(1), opacity 0 → 1, spring(stiffness:400)
Pay confirmation: green CTA, scale hover + tap feedback
Table row hover: background #FAFBFF
Sidebar nav hover: rgba(white, 0.05) bg, white text
Password strength: 4-segment bar, color shifts red → amber → green
```

---

## File structure
```
/src
  /styles
    theme.ts          ← all tokens
    globals.ts        ← GlobalStyles (styled-components)
  /components
    /ui
      index.tsx       ← StatCard, StatusBadge, Card, PageHeader, InitialsAvatar, EmptyState, MonoAmount
    /layout
      DashboardLayout.tsx
  /app
    /login            page.tsx   ← split panel, brand left + form right
    /signup           page.tsx   ← same layout, password strength meter
    /admin            page.tsx   ← overview dashboard
      /invoices       page.tsx   ← sortable table + new invoice modal
      /customers      page.tsx   ← customer table + add modal
      /analytics      page.tsx   ← 5 recharts panels
    /customer         page.tsx   ← personal dashboard
      /invoices       page.tsx   ← card grid with pay modal
```
