# Plexivia AI Assistant Instructions & Reference Memory

## 📌 Central Documentation Path
- **Docs Directory**: J:\My Drive\assets.docs.plexivia
- **Documentation Coverage**:
  - Plexivia-র সমস্ত প্রধান অ্যাপ্লিকেশন এবং সাব-অ্যাপ্লিকেশনের ডকুমেন্টেশন।
  - Cloudflare সেটিংস, ডোমেইন, DNS এবং কনফিগারেশন ইনভেন্টরি।
  - নিজস্ব এবং ক্লায়েন্টদের VPS, সার্ভার সেটআপ, কন্টেইনার এবং ডেপ্লয়মেন্ট ডকুমেন্টেশন।
  - আর্কিটেকচার গাইড, ডাটাবেস স্কিমা, BRS, API ডক্স, এবং ক্রেডেনশিয়াল/অ্যাক্সেস ডিরেক্টরি।

## 🔍 Instructions for AI
1. **ডকুমেন্টেশন রেফারেন্স**: Plexivia সংক্রান্ত যেকোনো আর্কিটেকচার, ডোমেইন, ক্লাউডফ্লেয়ার, ভিপিএস বা সাব-অ্যাপ্লিকেশনের রেফারেন্স প্রয়োজন হলে সর্বদা J:\My Drive\assets.docs.plexivia ফোল্ডারটিতে অনুসন্ধান করবে।
2. **প্রজেক্টের তথ্য অনুসন্ধান**: কোনো নতুন ফিচার, ক্লায়েন্ট ডিপ্লয়মেন্ট বা সার্ভার কনফিগারেশন করার পূর্বে সংশ্লিষ্ট ডক্স ফাইলগুলো চেক করে স্ট্যান্ডার্ড বজায় রাখবে।

# Workspace Guidelines & Rules

## Deployment Rule
- **Strictly prohibit automatic deployment**: Do NOT deploy to VPS or remote servers unless the user explicitly requests/commands to deploy.
- Always wait for explicit user instruction (e.g. 'deploy', 'deploy dao', 'server e tolo') before triggering any deployment script, VPS SSH deployment command, or server restart.



# AI & Development Guidelines (Demo Client)

## 00. Always put 1 line eng comment before every functions
## 00.1 J:\My Drive\CLIENTS\DEMO  this teh directory of docs
## 00.2 Doc File Naming Convention: Every documentation/note file name must strictly start with the date prefix `DDMMYY_` (e.g., `250926_task_overview.md`).
## 1. Primary Rules & Operating Principles

1. **Docs Folder Location & Zero Local Docs Rule**:
   - The master documentation, architecture guides, and credentials directory is located exclusively at:
     ```
     J:\My Drive\CLIENTS\DEMO
     ```
   - **লোকাল ডকসে আর কোনো কমিট নয় (No Local Docs Commits)**:
     - গিট রিপোজিটরির ভেতরে কোনো লোকাল ডকুমেন্টেশন বা ডকস ফাইলে কমিট করা সম্পূর্ণ নিষিদ্ধ।
     - আমরা এখন থেকে ডকুমেন্টেশন, গাইডলাইন, ক্রেডেনশিয়াল বা নোট আপডেট করব **শুধু এবং শুধুমাত্র আমাদের ইনস্ট্রাক্টেড ফোল্ডারে (`J:\My Drive\CLIENTS\DEMO`)**।
   - Always refer to and update files in this directory for server access, SSH keys, deployment credentials, Cloudflare R2 configurations, and environment secrets.

2. **Credential & Server Management**:
   - Strictly follow the documents inside `J:\My Drive\CLIENTS\DEMO` for any server IPs, passwords, tokens, or environment setup.
   - Do not hardcode or commit any sensitive credentials to version control.

3. **Strict Execution Directive**:
   - **Always execute exactly as instructed by the user.**
   - Do not introduce unsolicited structural changes or assume permissions beyond the user's explicit direction.

4. **Code Inspection & Frontend UI Updates**:
   - **Do not rely solely on terminal commands (e.g. grep, cat) to skim files.**
   - Before modifying frontend components or styling, thoroughly read and analyze the files using dedicated file viewing tools.
   - Understand the component tree, responsive layouts, Tailwind/CSS classes, state management, and UX design flow before implementing UI changes.

---

## 2. Git Commit Standards

### Commit Message Format
Every commit message must strictly follow this pattern starting from `DC01`:
```
<ID>(<type>): <description>
```

- **ID**: Sequential tracking identifier starting from `DC01` (e.g., `DC01`, `DC02`, `DC03`, ...).
- **type**: Action category in parentheses:
  - `feat`: New feature or capability
  - `fix`: Bug fix or patch
  - `ui`: UI design, layout, styling, and visual adjustments
  - `refc`: Code refactoring or cleanup
  - `docs`: Documentation updates
  - `perf`: Performance optimizations
  - `chor`: Maintenance chores, dependencies, configuration
  - `test`: Testing and validation scripts
- **description**: Clear, concise explanation of the change in sentence case.

### Examples:
- `DC01(feat): initialize demo store frontend product grid and category filtering`
- `DC02(ui): update mobile navigation bar and floating cart button styles`
- `DC03(fix): resolve price calculation discrepancy in cart checkout drawer`
- `DC04(docs): document external docs folder path and server connection guide`

### No Lazy Commits:
- Generic commit messages (e.g., `up`, `fix`, `test`, `wip`, `update`, `changes`) are strictly prohibited.
- Every commit must state the exact business or technical logic changed.

---

## 3. Strict Deployment Rules (STRICT — NO EXCEPTIONS)

> [!CAUTION]
> **না বলা পর্যন্ত কোনো ডিপ্লয় দিবে না (Do NOT run any deployment without explicit instruction).**

- **NEVER** run any VPS build, remote SSH command, `docker compose up --build`, or production deployment command without explicit instruction from the user.
- When the user explicitly instructs (e.g., *"ডিপ্লয় দাও"* or *"deploy now"*), only then execute the deployment commands using tools.
- Pushing to development/temporary branches or merging `temp` into `main`/`Live` on GitHub is permitted.
- The actual VPS deployment / build execution requires explicit user authorization every single time.

---

## 4. Code Style & Commenting Guardrails

- **Arrow Functions**: Always use arrow functions (`const myFunc = () => {}`) for all components, handlers, and helper routines. Avoid standard `function` declarations.
- **No Inline Comments**: Do not place inline comments inside function bodies, conditional branches, loops, or JSX elements.
- **Single-Line Preceding Function Comment**: Place exactly one concise single-line comment on the line immediately preceding function definitions.
- **Core Logic Guardrails**: Clarify with the user before altering core architectural patterns, multi-tenant resolution, inventory deduction, or payment pipelines.

