# mrkd - Markdown Sharing Platform

## Project Overview

**mrkd** is a modern, secure markdown sharing platform built with Next.js that allows users to paste markdown content, stores it securely in S3 via backend API, and generates unique shareable links to view formatted content.

## Tech Stack

- **Frontend**: Next.js (App Router)
- **Backend**: Next.js API Routes (serverless)
- **Storage**: AWS S3
- **Styling**: Tailwind CSS
- **Markdown**: react-markdown with remark-gfm
- **Syntax Highlighting**: rehype-highlight or prism-react-renderer
- **ID Generation**: nanoid or short-uuid
- **Type Safety**: TypeScript
- **Package Manager**: Bun

## Core Features

### 1. Markdown Editor Page (Home)

- Clean, distraction-free markdown editor
- Live preview toggle
- Character/word count
- Syntax highlighting in editor
- Auto-save to localStorage (draft recovery)
- Clear/Reset button
- "Share" button to generate link

### 2. Backend API Security

- All S3 operations happen server-side
- Rate limiting on API routes
- Content validation and sanitization
- File size limits (e.g., 1MB max)
- Optional: CAPTCHA for abuse prevention
- Environment variables for AWS credentials

### 3. Unique Link Generation

- Generate short, unique IDs (e.g., 8-12 characters)
- Format: `yourdomain.com/view/[unique-id]`
- Copy to clipboard functionality
- QR code generation option
- Share metadata for social previews

### 4. View Page

- Beautiful markdown rendering
- Dark/light mode toggle
- Print-friendly styling
- Copy markdown source button
- "Create Your Own" CTA
- Responsive design

## Project Structure

```
mrkd/
├── app/
│   ├── page.tsx                 # Home/Editor page
│   ├── view/
│   │   └── [id]/
│   │       └── page.tsx         # View shared markdown
│   ├── api/
│   │   ├── upload/
│   │   │   └── route.ts         # POST endpoint for markdown
│   │   └── fetch/
│   │       └── [id]/
│   │           └── route.ts     # GET endpoint for markdown
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── MarkdownEditor.tsx       # Editor component
│   ├── MarkdownPreview.tsx      # Preview component
│   ├── MarkdownViewer.tsx       # Full-page viewer
│   ├── CopyButton.tsx           # Copy to clipboard
│   ├── ShareModal.tsx           # Share link modal
│   └── ThemeToggle.tsx          # Dark mode toggle
├── lib/
│   ├── s3.ts                    # S3 client utilities
│   ├── utils.ts                 # Helper functions
│   └── constants.ts             # App constants
├── types/
│   └── index.ts                 # TypeScript types
├── public/
└── .env.local                   # Environment variables
```

## API Routes Specification

### POST /api/upload

**Request Body:**

```json
{
  "content": "# Markdown content here...",
  "name": "Optional document name" // Optional
}
```

**Response:**

```json
{
  "success": true,
  "id": "abc123xyz",
  "url": "https://yourdomain.com/view/abc123xyz"
}
```

**Logic:**

1. Validate content (check length, sanitize)
2. Generate unique ID (check for collisions)
3. **Create metadata object:**
   ```json
   {
     "created_at": "ISO 8601 timestamp",
     "name": "Optional document name",
     "creator_ip": "Hashed IP address",
     "is_encrypted": false,
     "version": "1.0"
   }
   ```
4. **Append metadata to content:**
   - Convert metadata JSON to base64
   - Append as LAST line: `<!-- META:${base64Metadata} -->`
5. Upload to S3 bucket with key: `markdown/{id}.md`
6. Set appropriate metadata and content-type
7. Return unique ID and full URL

### GET /api/fetch/[id]

**Response:**

```json
{
  "success": true,
  "content": "# Markdown content...",
  "metadata": {
    "createdAt": "2025-01-15T10:30:00Z",
    "size": 1234,
    "isEncrypted": false,
    "isEditable": true,
    "name": "My Document",
    "version": "1.2"
  }
}
```

**Logic:**

1. Validate ID format
2. Fetch from S3 bucket using key: `markdown/{id}.md`
3. Handle 404 if not found
4. **Extract metadata from last line:**
   - Check if last line matches `<!-- META:... -->` format
   - If valid, decode base64 to JSON
   - Log metadata internally (for future features like analytics)
5. **Remove last line** (metadata) from content before returning to frontend
6. Return clean content with public metadata (created_at, size, isEncrypted, isEditable, name, version)

### PUT /api/update/[id]

**Request:**

```json
{
  "content": "# Updated markdown content...",
  "editKey": "user-provided-edit-key",
  "isEncrypted": false
}
```

**Response:**

```json
{
  "success": true,
  "id": "abc123xyz",
  "message": "Document updated successfully",
  "version": "1.3"
}
```

**Logic:**

1. Validate ID format and content
2. Verify edit key is provided
3. Fetch existing document from S3
4. Extract metadata and verify edit key hash matches
5. Increment version number (e.g., 1.2 → 1.3, 1.9 → 2.0)
6. Create updated metadata preserving original fields
7. Append updated metadata to new content
8. Overwrite existing document in S3
9. Return success with new version number

### POST /api/verify-edit-key/[id]

**Request:**

```json
{
  "editKey": "user-provided-edit-key"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Edit key verified"
}
```

**Logic:**

1. Validate ID format
2. Fetch document from S3
3. Extract metadata and check for edit_key_hash
4. Hash provided edit key and compare with stored hash
5. Return success/failure without exposing stored hash

## Document Metadata Format

Each markdown document stored in S3 contains embedded metadata at the end:

### Metadata Structure

```json
{
  "created_at": "2025-10-18T12:34:56.789Z",
  "name": "Optional document name",
  "creator_ip": "SHA-256 hash of IP",
  "is_encrypted": false,
  "version": "1.0"
}
```

### Storage Format

Metadata is appended to the markdown content as an HTML comment:

```markdown
# My Document

This is the content...

<!-- META:eyJjcmVhdGVkX2F0IjoiMjAyNS0xMC0xOFQxMjozNDo1Ni43ODlaIiwibmFtZSI6Ik15IERvY3VtZW50IiwiY3JlYXRvcl9pcCI6Imhhc2hlZCIsImlzX2VuY3J5cHRlZCI6ZmFsc2UsInZlcnNpb24iOiIxLjAifQ== -->
```

### Metadata Fields

- **created_at**: ISO 8601 timestamp of document creation
- **name**: Optional user-provided document name
- **creator_ip**: SHA-256 hashed IP address (privacy-preserving)
- **is_encrypted**: Boolean flag for encryption status
- **edit_key_hash**: SHA-256 hashed edit key (optional, enables editing)
- **version**: Document version (starts at "1.0", auto-increments on updates: 1.1, 1.2, ... 1.9, 2.0, etc.)

### Privacy & Security

- IP addresses are hashed using SHA-256 before storage
- Metadata is not sent to frontend (backend only)
- Can be used for future features: analytics, moderation, owner verification
- **Simple validation**: Only the last line is checked for metadata

## AWS S3 Configuration

### Bucket Setup

- **Bucket Name**: `your-markdown-share-bucket`
- **Region**: Choose closest to users
- **Public Access**: Block all (access via signed URLs or backend only)
- **Versioning**: Optional (for content history)
- **Lifecycle Rules**: Optional (auto-delete after X days)

### IAM Policy (Minimal Permissions)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject"],
      "Resource": "arn:aws:s3:::your-markdown-share-bucket/markdown/*"
    }
  ]
}
```

### Environment Variables (.env.local)

```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=your-markdown-share-bucket
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

## UI/UX Design Guidelines

### Modern Design Principles

- **Minimalist Interface**: Focus on content, reduce clutter
- **Smooth Animations**: Framer Motion for transitions
- **Glass Morphism**: Subtle blur effects for modals/cards
- **Gradient Accents**: Modern color gradients for CTAs
- **Micro-interactions**: Hover effects, button feedback
- **Responsive**: Mobile-first approach

### Color Scheme (Example)

```css
/* Light Mode */
--background: #ffffff;
--foreground: #0a0a0a;
--accent: #3b82f6;
--muted: #f3f4f6;

/* Dark Mode */
--background: #0a0a0a;
--foreground: #fafafa;
--accent: #60a5fa;
--muted: #1f2937;
```

### Typography

- **Headings**: Inter or Geist (700 weight)
- **Body**: Inter or Geist (400 weight)
- **Code**: JetBrains Mono or Fira Code

## Component Implementation Details

### MarkdownEditor.tsx

```typescript
Features:
- Textarea with monospace font
- Tab key inserts 2 spaces
- Auto-resize based on content
- Toolbar with formatting buttons (optional)
- Split-screen preview toggle
- Draft auto-save every 2 seconds
- Character count display
```

### MarkdownViewer.tsx

```typescript
Features:
- Full markdown rendering with GFM support
- Code syntax highlighting
- Tables, task lists, strikethrough
- Automatic heading anchors
- Responsive images
- Copy code block buttons
```

### ShareModal.tsx

```typescript
Features:
- Display generated URL
- One-click copy to clipboard
- Visual feedback (checkmark animation)
- QR code display
- Social share buttons (optional)
- "Create Another" button
```

## Security Considerations

1. **Input Validation**

   - Max file size: 1MB
   - Content-type validation
   - XSS prevention through sanitization

2. **Rate Limiting**

   - Max 10 uploads per IP per hour
   - Implement using Vercel Edge Config or upstash/ratelimit

3. **S3 Security**

   - Never expose AWS credentials to frontend
   - Use IAM roles with minimal permissions
   - Consider signed URLs for private content

4. **Content Moderation**
   - Optional: Scan for inappropriate content
   - Store upload metadata (timestamp, IP hash)

## Performance Optimizations

1. **Caching**

   - Cache S3 responses with stale-while-revalidate
   - CDN for static assets
   - Server-side render view pages

2. **Code Splitting**

   - Lazy load markdown editor
   - Dynamic imports for heavy libraries

3. **Image Optimization**

   - Use Next.js Image component
   - Lazy load images in markdown

4. **Bundle Size**
   - Use lightweight markdown parser
   - Tree-shake unused dependencies

## Encryption Feature

### Symmetric Key-Based Encryption

Users can optionally encrypt their markdown with a password/key.

### How It Works

**When Creating:**
1. User writes markdown content
2. (Optional) Enters an encryption key/password
3. If key provided:
   - Content is encrypted using AES-256-GCM with key
   - `is_encrypted: true` set in metadata
   - Encrypted content stored in S3
4. Share link generated as normal

**When Viewing:**
1. User opens share link
2. Backend detects `is_encrypted: true` in metadata
3. Frontend shows password prompt
4. User enters decryption key
5. Client-side decryption using Web Crypto API
6. Decrypted markdown rendered

### Implementation Details

- **Algorithm**: AES-256-GCM (authenticated encryption)
- **Key Derivation**: PBKDF2 with SHA-256 (100,000 iterations)
- **Salt**: Random 16-byte salt stored with encrypted data
- **IV**: Random 12-byte initialization vector per encryption
- **Format**: `${salt}:${iv}:${encryptedContent}` (all base64)
- **Client-Side Only**: Encryption/decryption happens in browser
- **Zero-Knowledge**: Server never sees the encryption key

### Security Features

✅ **Authenticated encryption** prevents tampering
✅ **Random salt & IV** ensures unique ciphertexts
✅ **Key stretching** (PBKDF2) protects against brute force
✅ **Client-side crypto** - server never sees key
✅ **No key recovery** - if key lost, content is unrecoverable

## Additional Features (Optional Enhancements)

1. **Expiration Links**

   - Auto-delete after 7/30/90 days
   - User-selectable expiration

2. **Edit Links**

   - Generate separate edit token
   - Allow editing with special URL

3. **Analytics**

   - Track view counts
   - Store in DynamoDB or S3 metadata

4. **Export Options**

   - Download as .md file
   - Export to PDF
   - Copy HTML

5. **Collections**
   - User accounts (optional)
   - Organize multiple pastes
   - Private/public toggle

## Deployment

### Vercel (Recommended)

1. Connect GitHub repository
2. Add environment variables in dashboard
3. Deploy automatically on push
4. Configure custom domain

### Environment Setup

```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local

# Run development server
bun run dev

# Build for production
bun run build

# Start production server
bun start
```

## Testing Checklist

- [ ] Upload markdown content
- [ ] Generate unique link
- [ ] View shared markdown
- [ ] Copy link to clipboard
- [ ] Toggle dark/light mode
- [ ] Mobile responsive design
- [ ] Code syntax highlighting works
- [ ] Tables render correctly
- [ ] Rate limiting prevents abuse
- [ ] 404 page for invalid IDs
- [ ] Draft recovery from localStorage

## Key Dependencies

```json
{
  "dependencies": {
    "next": "latest",
    "react": "latest",
    "react-dom": "latest",
    "react-markdown": "latest",
    "remark-gfm": "latest",
    "rehype-highlight": "latest",
    "@aws-sdk/client-s3": "latest",
    "nanoid": "latest",
    "framer-motion": "latest"
  },
  "devDependencies": {
    "typescript": "latest",
    "tailwindcss": "latest",
    "autoprefixer": "latest",
    "postcss": "latest"
  }
}
```

## Getting Started

1. **Clone and Install**

   ```bash
   bunx create-next-app@latest mrkd --typescript --tailwind --app
   cd mrkd
   bun add @aws-sdk/client-s3 nanoid react-markdown remark-gfm rehype-highlight framer-motion
   ```

2. **Configure AWS**

   - Create S3 bucket
   - Generate IAM user with limited permissions
   - Add credentials to .env.local

3. **Build Core Features**

   - Start with editor component
   - Implement API routes
   - Create view page
   - Add styling and animations

4. **Test and Deploy**
   - Test locally with real S3 bucket
   - Deploy to Vercel
   - Test production environment

## Design Inspiration

- **Editor**: Similar to GitHub Gist, HackMD
- **Viewer**: Clean like Medium, Dev.to
- **Animations**: Smooth like Linear, Vercel
- **Colors**: Modern gradients like Stripe, Tailwind UI

## Success Metrics

- Page load time < 1 second
- Time to interactive < 2 seconds
- Mobile responsive score > 95
- Lighthouse performance > 90
- Zero security vulnerabilities

---

**Ready to build!** This spec provides everything needed to create a production-ready markdown sharing platform with modern UX, tight security, and optimal performance.
