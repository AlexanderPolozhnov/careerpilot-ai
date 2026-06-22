I've completely redesigned the auth pages with a world-class, Linear/Vercel/Clerk-inspired aesthetic. Here's what's new:

**Layout:**

- Split-screen design on desktop: left panel for branding/messaging, right panel for the form
- Responsive: full-width form on mobile with a compact header


**Left Panel (Desktop):**

- Gradient background with violet accents and subtle animated floating orbs
- Grid pattern overlay for depth
- Contextual headlines and descriptions that change based on auth mode
- Social proof section with avatar stack and compliance badges


**Right Panel (Form):**

- Sleek segmented control tabs for switching between Login/Register
- Custom input fields with icon prefixes and violet focus states
- Gradient submit button with glow effect
- Social login options (Google, GitHub) with refined hover states
- Proper error states with icons


**Visual Details:**

- All inputs have consistent 11px height with icons
- Purple/violet accent color throughout
- Subtle borders and glassmorphism effects
- Smooth transitions on all interactive elements
- SVG icons for each auth mode in the header


All `t('auth.*')` keys and form logic remain completely untouched. Ready for your feedback!

I've completely redesigned the landing page with a world-class aesthetic inspired by Linear, Vercel, and the design inspiration. Here's what's new:

**Hero Section:**

- Full-viewport height with dramatic animated gradient orbs and subtle grid pattern
- Large, bold headline with gradient accent text
- Animated badge with pulsing indicator
- Premium CTA buttons with glow effects and hover animations
- Trust badges with checkmark icons
- Interactive mock UI preview showing a dashboard with stats and kanban board


**Features Section:**

- Floating label badge
- Bento-grid style cards with hover glow effects, top accent lines, and scaling icons
- "Learn more" indicators that appear on hover
- Subtle background gradient orb


**How It Works Section:**

- Numbered step indicators in rounded squares with pulse animation
- Horizontal connection line between steps (desktop)
- Gradient background accent
- Clean, centered layout


**Final CTA Section:**

- Glass-morphic card with gradient background
- Decorative blur orbs
- Trust indicators (Free forever, No credit card, Setup in minutes)
- Bold headline with prominent CTA button


**Footer:**

- Minimal footer with logo and copyright


All existing `t('landing.*')` keys remain untouched. The page uses a refined color palette with violet/purple accents on a deep dark background (`#08080a`).

I've completely redesigned both vacancy pages with a world-class Linear/Vercel/Notion-inspired aesthetic.

**VacanciesPage (List):**

- **Page header** with branded icon and title/subtitle
- **Premium filter bar** with custom-styled search input, dropdowns with custom chevron icons, view toggle buttons (list/grid), results counter, and gradient "Add" button
- **List view cards** with company avatar placeholders, hover glow effects, badges row, and subtle arrow indicators
- **Table view** with clean header styling, row hover states, and refined typography
- **Redesigned modal** with backdrop blur, sticky header, and proper close button


**VacancyDetailPage (Detail):**

- **Breadcrumb** back navigation with arrow icon
- **Header card** with company avatar, title, location, badges, and external link button with gradient top accent
- **Stats cards** showing salary and contract type with icons
- **Description section** with proper whitespace handling
- **Company info card** with avatar, description, and tag badges including website link
- **Action buttons row** with edit, delete (red accent), save, and primary "Apply" gradient button
- **AI Insights sidebar** with gradient panel, sparkles icon, generate button with loading state
- **Quick actions** panel with AI-powered suggestions

The redesign is complete. I've created a world-class AI Assistant page inspired by Linear, Vercel, and Perplexity. Here's what I've done:

**Design Highlights:**

1. **Hero Header** - A refined header with a subtle radial gradient glow, featuring the AI sparkle icon with a violet glow effect, clean typography hierarchy.
2. **Tool Selector** - Horizontal pill-style navigation with animated active states (pulsing dot indicator), smooth hover transitions, and tool-specific icons.
3. **Form Panel** - Dynamic gradient backgrounds that change based on selected tool (violet/blue/emerald/amber), clean input styling with focus states, and a shimmer effect on the submit button.
4. **Results & History** - Cards with subtle borders and hover effects, type-specific color coding for different AI action types, skeleton loading states.
5. **Color System** - Deep blacks (`#08090d` base), pure whites for text hierarchy, violet (`#8b5cf6`) as the primary accent with supporting blues, emeralds, and ambers.
6. **Typography** - Inter font family, careful spacing with uppercase tracking on labels, relaxed line heights for readability.
7. **Micro-interactions** - Hover states on all interactive elements, shimmer animations, smooth color transitions, scale effects on icons.


Both pages use consistent styling: deep dark backgrounds, subtle borders, violet/purple accents, refined shadows, and smooth transitions throughout.

The Analytics page has been completely redesigned with a premium Vercel-inspired aesthetic. Key design highlights:

1. **KPI Cards** - Four prominent cards with subtle hover glows, color-coded icons (violet, blue, emerald, amber), trend indicators, and large typography for quick scanning.
2. **Application Funnel** - Full-width horizontal bars with status-specific colors, smooth hover transitions, and clear count/percentage labels. Each status has its own color identity.
3. **Weekly Activity Chart** - A mini bar chart with three color-coded metrics (applied/interviews/offers), a legend, and summary stats for the current week.
4. **Skill Gaps List** - Clean list items with checkmark/X badges indicating acquired vs. gap skills, mention frequency, and color-coded status pills.
5. **Visual Polish** - Time range selector buttons in header, gradient icon backgrounds, staggered animations, and a cohesive dark theme with carefully balanced white/alpha values.

The Settings page has been completely redesigned with a world-class aesthetic inspired by Linear, Vercel, and Clerk. Key design highlights:

1. **Clean Section Structure** - Each settings group (Profile, Language, AI Provider, Notifications, Danger Zone) lives in its own card with a gradient icon header, clear title, and subtle description.
2. **Premium Profile Section** - Avatar with gradient background showing user initial, clean form inputs with icon labels, and smooth loading states on the save button.
3. **Language Selector** - Side-by-side cards with flag emojis, violet highlight for active selection, and checkmark indicator.
4. **AI Provider Mode** - Radio-style selection cards with icons (Cloud/CPU/Key), descriptions for each mode, and elegant active state.
5. **Toggle Switches** - Custom Toggle component with smooth animations replacing basic checkboxes, paired with descriptive icons and helper text.
6. **Danger Zone** - Red-tinted section with shield icon, confirmation flow for delete account action.

All three app shell components have been redesigned with a world-class aesthetic inspired by Linear, Vercel, and Craft. Here are the key design highlights:

**Sidebar:**

- Clean logo section with gradient icon and online status indicator
- Vertical navigation with subtle active state bar on the left
- AI badge on the AI Assistant item
- Elegant tip card with amber icon and subtle glow effect
- Keyboard shortcut hint in footer


**Topbar:**

- Minimal header with refined typography hierarchy
- Centered search bar with keyboard shortcut hint and focus expansion
- Notification bell with indicator dot
- Clean action buttons with subtle hover states
- User avatar with gradient and status indicator


**Toast Notifications:**

- Dark glassmorphism style with backdrop blur
- Type-specific icon containers with subtle background tints
- Animated progress bar showing time remaining
- Smooth slide-in animation from the right
- Refined close button with hover state