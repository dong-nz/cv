# Website Audit Report: cv.vugado.com

**Website:** https://cv.vugado.com/  
**Audit date:** 29 October 2026  
**Scope:** technical SEO, basic security, public-page functionality, and general recommendations.

## 1. Executive Summary

The website fulfils its primary purpose as a personal portfolio: presenting professional experience, showcasing projects, and providing contact details and a resume in two languages. The main user journeys tested are working.

The main area requiring improvement is technical SEO. Internal pages share the same metadata and point their canonical URLs to the homepage, nonexistent URLs are not handled correctly, and the main content becomes available only after JavaScript executes. These issues may prevent search engines from processing and indexing individual pages correctly.

Regarding security, HTTPS is configured, and the tested unauthenticated request to the editor API was rejected. However, several security-related HTTP headers are missing. These are security-hardening gaps, not evidence of a compromise or the ability to modify the website without permission.

**Recommended order of work:** correct metadata and canonical URLs, implement proper 404 responses, add security headers, and enable asset compression; then improve page generation, language versions, and content presentation.

## 2. Audit Scope

The audit covered nine public pages: Home, About, Experience, Projects, Contact, Philosophy, How it works, and two project detail pages.

The following were checked:

- HTTP responses, initial HTML, and content rendered after JavaScript execution;
- title, description, canonical URLs, Open Graph, H1–H3 headings, and structured data;
- robots.txt, sitemap.xml, and the response to one nonexistent URL;
- navigation to projects and contacts, language switching, and the resume selection dialog;
- availability of both PDF resume versions;
- size, compression, and caching of the main JS/CSS assets;
- HTTPS, the certificate, and security-related HTTP headers;
- public client-side code and one unauthenticated HEAD request to the editor API;
- homepage horizontal overflow through DOM measurements at viewport widths of 375 and 1440 pixels.

The audit was non-destructive: no website data was changed, no save operations were performed, and no password guessing or load testing was carried out.

## 3. What Is Working Correctly

| Area | Finding | Value to the website |
|---|---|---|
| Public pages | All nine pages checked are accessible and display content after JavaScript executes. | Visitors can browse the portfolio. |
| Main navigation | The tested links to the project list, a project detail page, and contacts work. | Navigation does not block the main user journeys tested. |
| Language switcher | Switches between English and Vietnamese content and updates the document language attribute. | Visitors can choose their preferred language. SEO for the language versions requires separate improvements. |
| Resume | The language selection dialog opens, and both PDF links return 200 with the application/pdf content type. | The files are available for download. PDF content and layout were not assessed separately. |
| HTTPS | Certificate validation succeeds; HTTP redirects to HTTPS with a 301 response. | The connection is encrypted. |
| Certificate | At the time of the audit, the certificate is valid until 5 January 2027. | There is no certificate expiry error; automatic renewal should be monitored. |
| Search crawler access | robots.txt allows crawling and references sitemap.xml. | The checked robots.txt does not block crawling of the website. |
| Sitemap | sitemap.xml contains nine HTTPS URLs, with no apparent structural errors. | Search engines are provided with a list of pages. |
| Basic SEO markup | The initial HTML includes title, description, Open Graph, Twitter Cards, and Person JSON-LD. | Basic metadata is available without JavaScript execution. Page-specific metadata still needs to be corrected. |
| Homepage UTM parameters | The canonical URL points to the clean homepage URL without campaign parameters. | This reduces the risk of duplicate homepage URLs caused by tracking tags. |
| External links | The checked links that open in a new tab use noopener noreferrer. | A basic safeguard for opening external websites is in place. |
| Caching | The main hashed JS/CSS files are cached for 30 days with immutable. | Repeat visits require fewer downloads. |
| Editor authentication | The tested API HEAD request without credentials returned 401 Unauthorized and a Basic Auth challenge. | Authentication is enforced for this request. This is not a complete assessment of all API operations. |
| Responsive structure | DOM checks at 375 and 1440 pixels found no horizontal overflow on the homepage. | The basic page width is correct under these conditions; visual testing on devices is still required. |

## 4. Required Improvements

### 4.1. High Priority: Page-Specific SEO

**Finding.** All nine pages return the same title and description, while canonical and og:url point to the homepage. This remains unchanged after JavaScript executes on the internal pages checked.

**Why it matters.** The website signals to search engines that the homepage is the preferred version of its internal pages. This conflicts with those pages having distinct content and may interfere with their separate indexing. Shared links also lack project-specific descriptions.

**Recommendations:**

- Give each standalone indexable page a canonical URL pointing to its own clean address.
- Write a unique title and description that reflect the page content.
- Set page-specific og:title, og:description, and og:url values, plus a project image where appropriate.
- Include the correct metadata in the initial HTML, not only after JavaScript execution.
- Keep canonical URLs, internal links, and sitemap.xml URLs consistent.

**Acceptance criteria:** each page's initial HTML contains its own metadata and canonical URL; project pages no longer identify the homepage as their canonical version.

### 4.2. High Priority: Correct Error Page Handling

**Finding.** The nonexistent URL `/seo-audit-not-found-20261029` returns HTTP 200, an index, follow meta directive, and an empty main content area instead of an error page.

**Why it matters.** Visitors are not told what happened, and search engines may classify the response as a soft 404: an error page incorrectly served with a success status.

**Recommendations:**

- Return a genuine HTTP 404 status for unknown URLs.
- Display a clear message with links to the homepage and projects.
- Do not use a homepage canonical URL as a substitute for the correct error status.
- After changing server routing, test direct navigation and refreshes on all existing pages.

**Acceptance criteria:** unknown URLs return 404, while existing pages remain directly accessible with a 200 response.

### 4.3. Priority Security Hardening: HTTP Security Headers

**Finding.** The checked HTML responses lack Content-Security-Policy, Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options, and explicit Referrer-Policy and Permissions-Policy headers.

**Recommendations:**

| Setting | Purpose and implementation considerations |
|---|---|
| Content-Security-Policy | Restrict permitted sources of scripts, styles, and other resources. Test the policy in Report-Only mode first. Account for existing inline scripts using appropriate hashes or nonces. |
| CSP frame-ancestors | Prevent third-party embedding unless it is required. Where appropriate, supplement this with a consistent X-Frame-Options header. |
| Strict-Transport-Security | Instruct browsers to use HTTPS for subsequent connections. Introduce it after confirming reliable HTTPS operation; use includeSubDomains only when all affected subdomains are ready. |
| X-Content-Type-Options: nosniff | Prevent MIME sniffing that could override the declared Content-Type. |
| Referrer-Policy | Explicitly define how much Referer information is sent. Consider strict-origin-when-cross-origin for a typical portfolio. |
| Permissions-Policy | Restrict unnecessary browser capabilities, such as geolocation, camera, and microphone access, if the website does not use them. |

**Acceptance criteria:** the required policies appear on the relevant responses without breaking public pages or authorized editor workflows. Error responses are checked separately.

Missing headers alone do not establish the presence of XSS, a data leak, or a website takeover vulnerability. No specific exploitable impact was established through this review.

### 4.4. Medium Priority: Content Availability Without JavaScript

**Finding.** The initial HTML body contains an empty application container. Portfolio text, headings, and navigation are generated on the client.

**Why it matters.** Google can execute JavaScript, but processing depends on a separate rendering stage. Other crawlers may have more limited capabilities. Visitors may also lose access to the main content if application loading fails.

**Recommendation:** for a small portfolio, consider static generation or build-time prerendering. Server-side rendering is also an option, but it is not essential if content only changes during publication.

**Acceptance criteria:** the initial HTML contains the main text, page heading, working links, and metadata before JavaScript executes.

### 4.5. Medium Priority: SEO for Both Language Versions

**Finding.** Switching languages does not change the URL, and hreflang is absent. After switching to Vietnamese, the metadata and primary Open Graph locale remain English.

**Recommendations:**

- If both language versions should appear in search results, provide separate, stable URLs for them.
- Localize titles, descriptions, and social sharing metadata.
- Add reciprocal hreflang links and the correct lang attribute.
- Use a self-referencing canonical URL for each language page.
- Make the language switcher lead to the equivalent page in the other language, rather than always to the homepage.

If the second language is only a convenience for visitors and separate search visibility is not a goal, this work can be assigned a lower priority. It does not block the more urgent canonical and 404 fixes.

### 4.6. Medium Priority: Compression and Performance

**Finding.** The two main JS files and the CSS file are delivered without gzip/Brotli, despite the client advertising compression support. Their combined size is 542,833 bytes, approximately 543 KB. Compression was observed for HTML.

**Recommendations:**

- Enable gzip or Brotli for JavaScript and CSS.
- Preserve long-lived caching for assets with hashes in their filenames.
- Check that editor code and optional features do not unnecessarily increase the initial download.
- Measure mobile performance after the fixes, then optimize the actual bottlenecks.

**Acceptance criteria:** the server returns compressed JS/CSS when supported by the client's Accept-Encoding header; transfer size decreases without functional regressions.

The audit did not establish that the website is slow: reliable Lighthouse scores and field Core Web Vitals were not obtained. It identified a specific opportunity to reduce download size.

### 4.7. Planned Improvements: Headings, Content, and Link Previews

**Findings:**

- The About, Experience, Projects, Contact, Philosophy, and How it works pages have no H1 heading.
- Project detail pages use H3 headings after H1 without an intermediate H2 level.
- The IoT-DWS project page displays raw Markdown code fences and internal text/diagram labels.
- The Open Graph image declares dimensions of 1200×1600, but the actual file is 500×667.

**Recommendations:**

- Use H1 for each page's main heading and a logical heading hierarchy for subsections.
- Render diagrams and code blocks correctly, and remove internal labels from public-facing content.
- Prepare a separate wide image for link sharing; 1200×630 pixels is a practical option.
- Declare the actual image dimensions and test previews in the messaging platforms used, including Zalo.

These changes improve structure, accessibility, and presentation, but they do not guarantee higher search rankings.

## 5. General Website Recommendations

The following are recommendations and areas for additional review, not confirmed defects.

### Content and Credibility

- Clearly state the professional specialization, core capabilities, and preferred type of engagement in the first screen.
- Structure project case studies around the problem, individual role, constraints, solution, and outcome. Include measurable results only where they can be substantiated.
- Check that dates, job titles, and descriptions are consistent across the website and both PDF resume versions.
- Review the quality of English and Vietnamese copy. Retain established technical terms, but avoid mixing languages where it makes the text harder to understand.
- Do not publish confidential information from previous employers, internal addresses, access keys, or private project materials.

### Usability and Accessibility

- Run a complete visual check on phones and computers, covering menus, long headings, both languages, display themes, and the CV download dialog.
- Test keyboard navigation, visible focus, closing dialogs with Escape, and returning focus to the button that opened the dialog.
- Check text and control contrast across all available color themes.
- Review link labels, image alternative text, and tap-target usability on small screens.
- Respect the system's reduced-motion preference when using noticeable transitions or effects.

### Search Visibility and Measurement

- Verify the website in Google Search Console, submit the sitemap, and investigate reasons why pages are excluded from the index.
- After the fixes, use URL Inspection to check the homepage, project list, and individual project pages.
- Update sitemap lastmod values when page content changes meaningfully, rather than automatically when content has not changed.
- Monitor Core Web Vitals separately for mobile and desktop. Do not substitute a single laboratory measurement for real-user data.
- If analytics is needed, measure useful actions such as contact-link clicks, project views, and CV downloads. Define privacy and visitor-notice requirements before implementation.

### Operations and Editor Security

- Maintain automatic certificate renewal and alerts before expiry.
- Review protection for every editor API operation, rather than relying on interface visibility or one HEAD response.
- Check login-attempt limits and logging of failed authentication; password guessing was not performed during this audit.
- Assess CSRF protection for state-changing operations in light of the actual authentication mechanism.
- Store integration secrets only on the server and grant them the minimum required permissions.
- Keep dependencies up to date and maintain a tested recovery and deployment rollback procedure.
- Test security policy and server routing changes in a staging environment first.

## 6. Suggested Implementation Order

| Stage | Work | Verifiable outcome |
|---|---|---|
| 1. Fix core technical issues | Unique metadata, correct canonical URLs, and genuine HTTP 404 responses. | Each page has its own SEO metadata; unknown URLs no longer return a success response. |
| 2. Strengthen basic security and reduce downloads | Security headers, gzip/Brotli, and a review of API authentication and authorization configuration. | Policies work without breaking functionality; JS/CSS are compressed; access controls are reviewed within the agreed scope. |
| 3. Improve indexing and presentation | Static generation/prerendering, language-specific URLs if needed, H1 headings, project formatting, and Open Graph images. | Content is available in the initial HTML, language pages are distinguishable, and public content and previews are well presented. |
| 4. Repeat the audit | Search Console, mobile browser testing, accessibility, performance, and key user journeys. | Results are confirmed through measurements and regression testing after deployment. |

## 7. Limitations and Interpretation

- Findings describe the website as observed on 29 October 2026. A follow-up check is required after changes are deployed.
- The source repository, server configuration, logs, Search Console, and analytics were not available for review.
- Actual indexing, rankings, and search traffic were not verified.
- Screenshot-based visual testing could not be completed because the embedded browser's visible surface was unavailable. DOM checks do not replace visual testing on devices.
- A 401 response to one request does not establish that all API methods are protected. Write operations, authentication bypass, and password strength were not tested.
- The absence of confirmed vulnerabilities in this review is not a guarantee of complete website security.

**Conclusion:** the portfolio's core functionality works. The immediate priorities are to fix the confirmed technical SEO issues and strengthen basic security settings. Further improvements should be guided by follow-up testing rather than assumptions.
