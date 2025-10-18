# mrkd - Simple Markdown Sharing Platform

A modern, secure markdown sharing platform built with Next.js that allows users to paste markdown content, stores it securely in AWS S3, and generates unique shareable links to view beautifully formatted content.

## Features

- **Clean Markdown Editor** - Distraction-free writing experience with monospace font and tab support
- **Live Preview** - Toggle split-screen preview to see your markdown rendered in real-time
- **Smart Auto-save** - Content automatically saved to localStorage for draft recovery
- **Secure Storage** - All content stored in AWS S3 with server-side API routes
- **Unique Links** - Generate short, shareable URLs for your markdown
- **Dark Mode** - Beautiful dark/light mode with smooth transitions
- **Syntax Highlighting** - Code blocks with syntax highlighting using highlight.js
- **GitHub Flavored Markdown** - Full GFM support including tables, task lists, and strikethrough
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Print-Friendly** - Clean printing support for shared markdown
- **Rate Limiting** - Built-in protection against abuse (10 uploads per hour per IP)

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Runtime**: Bun
- **Styling**: Tailwind CSS 4
- **Markdown**: react-markdown with remark-gfm
- **Syntax Highlighting**: rehype-highlight with highlight.js
- **Storage**: AWS S3
- **Animations**: Framer Motion
- **Type Safety**: TypeScript
- **ID Generation**: nanoid

## Project Structure

```
mrkd/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── upload/route.ts       # POST endpoint for markdown
│   │   │   └── fetch/[id]/route.ts   # GET endpoint for markdown
│   │   ├── view/[id]/page.tsx        # View shared markdown
│   │   ├── page.tsx                  # Home/Editor page
│   │   ├── layout.tsx                # Root layout
│   │   ├── globals.css               # Global styles
│   │   └── not-found.tsx             # 404 page
│   ├── components/
│   │   ├── MarkdownEditor.tsx        # Editor component
│   │   ├── MarkdownPreview.tsx       # Preview component
│   │   ├── MarkdownViewer.tsx        # Full-page viewer
│   │   ├── ShareModal.tsx            # Share link modal
│   │   ├── CopyButton.tsx            # Copy to clipboard
│   │   └── ThemeToggle.tsx           # Dark mode toggle
│   ├── lib/
│   │   ├── s3.ts                     # S3 client utilities
│   │   ├── utils.ts                  # Helper functions
│   │   └── constants.ts              # App constants
│   └── types/
│       └── index.ts                  # TypeScript types
├── public/                           # Static assets
├── .env.local                        # Environment variables
└── .env.example                      # Example env file
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed on your system
- AWS account with S3 access
- AWS IAM user with S3 permissions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd mrkd
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Configure AWS S3

#### Create an S3 Bucket

1. Go to AWS S3 Console
2. Create a new bucket (e.g., `your-markdown-bucket`)
3. Choose your preferred region
4. Block all public access (we'll use server-side access only)
5. Enable versioning (optional)

#### Create IAM User

1. Go to AWS IAM Console
2. Create a new user with programmatic access
3. Attach the following policy (replace bucket name):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject"],
      "Resource": "arn:aws:s3:::your-markdown-bucket/markdown/*"
    }
  ]
}
```

4. Save the Access Key ID and Secret Access Key

### 4. Set Up Environment Variables

Copy the example environment file and fill in your AWS credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
S3_BUCKET_NAME=your-markdown-bucket

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 5. Run the Development Server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Creating a Shared Markdown

1. Open the application
2. Type or paste your markdown content in the editor
3. (Optional) Click "Show Preview" to see the rendered output
4. Click "Share" to upload and generate a unique link
5. Copy the generated link and share it with others

### Viewing Shared Markdown

1. Open the shared link (e.g., `https://yourdomain.com/view/abc123xyz`)
2. View the beautifully rendered markdown
3. Use "Copy Source" to copy the original markdown
4. Use "Create Your Own" to create a new markdown

### Keyboard Shortcuts

- `Tab` - Insert 2 spaces (in editor)
- `Escape` - Close share modal

## API Routes

### POST /api/upload

Upload markdown content and get a unique share link.

**Request:**
```json
{
  "content": "# Your markdown here..."
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

### GET /api/fetch/[id]

Fetch markdown content by ID.

**Response:**
```json
{
  "success": true,
  "content": "# Your markdown...",
  "metadata": {
    "createdAt": "2025-01-15T10:30:00Z",
    "size": 1234
  }
}
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables in the Vercel dashboard:
   - `AWS_REGION`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `S3_BUCKET_NAME`
   - `NEXT_PUBLIC_BASE_URL` (your production domain)
5. Deploy!

### Custom Domain

1. Add your custom domain in Vercel settings
2. Update `NEXT_PUBLIC_BASE_URL` to your custom domain
3. Redeploy the application

## Configuration

### Rate Limiting

Default: 10 uploads per hour per IP address

Edit in `src/lib/constants.ts`:
```typescript
export const RATE_LIMIT = {
  MAX_REQUESTS: 10,
  WINDOW_MS: 60 * 60 * 1000, // 1 hour
};
```

### Content Size Limit

Default: 1MB

Edit in `src/lib/constants.ts`:
```typescript
export const MAX_CONTENT_SIZE = 1024 * 1024; // 1MB
```

### Auto-save Delay

Default: 2 seconds

Edit in `src/lib/constants.ts`:
```typescript
export const AUTOSAVE_DELAY = 2000; // 2 seconds
```

## Security Features

- **Server-side S3 access** - AWS credentials never exposed to frontend
- **Rate limiting** - Prevents abuse and spam
- **Content validation** - Validates size and format
- **Input sanitization** - Prevents XSS attacks
- **No public S3 access** - All content accessed through backend API

## Development

### Build for Production

```bash
bun run build
```

### Start Production Server

```bash
bun start
```

### Lint Code

```bash
bun run lint
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Markdown rendering by [react-markdown](https://github.com/remarkjs/react-markdown)
- Syntax highlighting by [highlight.js](https://highlightjs.org/)
- Animations by [Framer Motion](https://www.framer.com/motion/)

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Built with ❤️ using Next.js, Tailwind CSS, and AWS S3**