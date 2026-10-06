# Fix: Navigation & Router Links Causing Full Page Reloads

## Problem

Internal navigation links cause full page reloads instead of client-side routing. Root causes:

1. **RollingTextLink** (`src/components/ui/RollingTextLink.tsx`) — renders `<a href={to}>` for all nav items
2. **Button** (`src/components/ui/Button.tsx`) — renders `<motion.a href={href}>` for all href values, including internal routes
3. **Projects** (`src/components/sections/Projects.tsx`) — uses `<motion.a href="/projects">` and `<motion.a href="/projects/:id">`

## Changes

### 1. `src/components/ui/RollingTextLink.tsx`

Replace `<a>` with React Router `<Link>`.

```diff
import { Link } from "react-router"

-  return (
-    <a
-      href={to}
-      className={className}
-      onClick={onClick}
-      onPointerEnter={() => { hovered.current = true; requestActive(true) }}
-      onPointerLeave={() => { hovered.current = false; requestActive(focused.current) }}
-      onFocus={() => { focused.current = true; requestActive(true) }}
-      onBlur={() => { focused.current = false; requestActive(hovered.current) }}
-    >
+  return (
+    <Link
+      to={to}
+      className={className}
+      onClick={onClick}
+      onPointerEnter={() => { hovered.current = true; requestActive(true) }}
+      onPointerLeave={() => { hovered.current = false; requestActive(focused.current) }}
+      onFocus={() => { focused.current = true; requestActive(true) }}
+      onBlur={() => { focused.current = false; requestActive(hovered.current) }}
+    >
       <span style={{ position: "relative", display: "inline-block", overflow: "hidden" }}>
         <motion.span
           style={{ display: "block", whiteSpace: "nowrap" }}
           variants={outgoingVariants}
           initial="rest"
           animate={active ? "active" : "rest"}
           onAnimationComplete={completeAnimation}
           transition={transition}
         >
           {children}
         </motion.span>
         <motion.span
           style={{
             display: "block",
             whiteSpace: "nowrap",
             position: "absolute",
             inset: 0,
           }}
           variants={incomingVariants}
           initial="rest"
           animate={active ? "active" : "rest"}
           transition={transition}
         >
           {children}
         </motion.span>
       </span>
-    </a>
+    </Link>
   )
```

**Rationale:** `<Link>` renders an `<a>` element under the hood but intercepts click events for client-side navigation. Animation event handlers (`onPointerEnter`, `onFocus`, etc.) work identically since the DOM element is the same.

---

### 2. `src/components/ui/Button.tsx`

Detect internal routes (`href` starts with `/`) → use `motion(Link)`. External URLs keep `motion.a`.

```diff
import { Link } from "react-router"

 type ButtonVariant = "primary" | "secondary" | "ghost"
 type ButtonSize = "sm" | "md" | "lg"

 interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
   variant?: ButtonVariant
   size?: ButtonSize
   href?: string
   download?: boolean
   children: React.ReactNode
 }

 // ... variantClasses, sizeClasses unchanged ...

 export const Button = forwardRef<
   HTMLButtonElement | HTMLAnchorElement,
   ButtonProps
 >(
   (
     {
       variant = "primary",
       size = "md",
       href,
       className = "",
       children,
+      download,
       ...props
     },
     ref
   ) => {
     const classes = `${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim()

     if (href) {
+      const isRoute = href.startsWith("/")
+      const safeProps = { ...props }
+      if (isRoute) {
+        delete (safeProps as Record<string, unknown>)["download"]
+      }
+
+      if (isRoute) {
+        return (
+          <motion(Link
+            to={href}
+            className={classes}
+            ref={ref as React.Ref<HTMLAnchorElement>}
+            whileTap={{ scale: 0.95 }}
+            {...(safeProps as Omit<
+              React.AnchorHTMLAttributes<HTMLAnchorElement>,
+              keyof ButtonProps | "to"
+            >)}
+          >
+            {children}
+          </motion(Link)>
+        )
+      }
+
       return (
         <motion.a
           href={href}
           className={classes}
           ref={ref as React.Ref<HTMLAnchorElement>}
           whileTap={{ scale: 0.95 }}
           {...(props as Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonProps>)}
         >
           {children}
         </motion.a>
       )
     }

     return (
       <motion.button
         className={classes}
         ref={ref as React.Ref<HTMLButtonElement>}
         whileTap={{ scale: 0.95 }}
         {...(props as Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonProps>)}
       >
         {children}
       </motion.button>
     )
   }
 )
```

**Rationale:**
- Internal routes (`/projects`, `/contact`) → `motion(Link)` for client-side nav
- External URLs (GitHub, LinkedIn) → `motion.a` unchanged
- `download` prop stripped for internal routes (invalid on `<Link>`, no-op on same-origin `<a>`)

---

### 3. `src/components/sections/Projects.tsx`

Replace `<motion.a>` with `motion(Link)` for project cards and "View All" link.

```diff
import { Link } from "react-router"
 import { motion } from "motion/react"
 import { Badge } from "@/components/ui/Badge"
 import { projects } from "@/data/projects"
 import { InView } from "@/components/ui/InView"

 // ... categoryLabels, Projects function start unchanged ...

         <motion.div
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true, amount: 0.5 }}
           variants={{
             hidden: { opacity: 0 },
             visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
           }}
         >
           <h2 id="projects-heading">Featured Projects</h2>
-          <motion.a
-            href="/projects"
-            style={{ fontSize: "14px", fontWeight: 500, color: "var(--accent)" }}
-            whileHover={{ scale: 1.05 }}
-            whileTap={{ scale: 0.95 }}
-          >
+          <motion(Link
+            to="/projects"
+            style={{ fontSize: "14px", fontWeight: 500, color: "var(--accent)" }}
+            whileHover={{ scale: 1.05 }}
+            whileTap={{ scale: 0.95 }}
+          >
             View All →
-          </motion.a>
+          </motion(Link)>
         </motion.div>
         <div className="projects-grid">
           {featured.map((project, i) => (
-            <motion.a
-              key={project.id}
-              href={`/projects/${project.id}`}
+            <motion(Link
+              key={project.id}
+              to={`/projects/${project.id}`}
               className="project-card"
               variants={{
                 hidden: { opacity: 0, y: 30 },
                 visible: {
                   opacity: 1,
                   y: 0,
                   transition: { duration: 0.5, delay: i * 0.1 },
                 },
               }}
               whileHover={{ scale: 1.02, y: -4 }}
               whileTap={{ scale: 0.98 }}
             >
               {/* card content unchanged */}
-            </motion.a>
+            </motion(Link)>
           ))}
         </div>
```

**Rationale:** `motion(Link)` passes `whileHover`/`whileTap` to the underlying `<a>` element. Animation behavior is identical.

---

### 4. `src/components/sections/Hero.tsx`

Replace `download` with `target="_blank"` for resume PDF link.

```diff
-<Button href="/resume.pdf" variant="secondary" download>
+<Button href="/resume.pdf" variant="secondary" target="_blank">
   Download Resume
 </Button>
```

**Rationale:**
- `download` attribute has no effect on same-origin URLs (browsers ignore it)
- Button already strips `download` for internal routes (now `/resume.pdf` is treated as a route)
- `target="_blank"` opens PDF in new tab, which is the expected behavior

---

## Verification

| Element | Expected Behavior |
|---|---|
| Nav menu items (Home, About, etc.) | Client-side nav, no page reload |
| Logo "Portfolio" | Client-side nav to `/`, no reload |
| Mobile menu items | Client-side nav + menu auto-closes |
| "View Projects" button | Client-side nav to `/projects` |
| "Contact Me" button | Client-side nav to `/contact` |
| "Download Resume" button | Opens `/resume.pdf` in new tab |
| "View All →" link | Client-side nav to `/projects` |
| Project cards | Client-side nav to `/projects/:id` |
| Social links (GitHub, LinkedIn) | Open in new tab (unchanged) |
| Skip-to-content link | Jumps to `#main-content` on same page |
