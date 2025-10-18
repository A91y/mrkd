# mrkd

> Share markdown instantly with beautiful, secure links

A modern markdown sharing platform that lets you paste content, generate a unique link, and share it with anyone. Clean editor, live preview, and gorgeous rendering included.

## ✨ Features

**For Writers**

- 📝 Distraction-free markdown editor with live preview
- 💾 Auto-save drafts to localStorage
- 🎨 Beautiful syntax highlighting for code blocks
- ✅ Full GitHub Flavored Markdown support

**For Sharing**

- 🔗 Generate short, unique shareable links
- 📱 QR code for easy mobile sharing
- 🔐 Optional password protection
- ✏️ Edit with secure edit keys
- 🌙 Dark/light mode support

**For Developers**

- 🚀 Built on Next.js 15 with App Router
- 🎯 TypeScript for type safety
- 🎨 Tailwind CSS 4 for styling
- ☁️ Secure AWS S3 storage
- 🔒 Rate limiting & content validation

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local

# Run development server
bun dev
```

## 📖 Usage

1. **Write** - Type or paste your markdown in the editor
2. **Preview** - Toggle preview to see how it looks
3. **Share** - Click share to generate a unique link
4. **Enjoy** - Your markdown is now beautifully rendered and shareable!

## 🛠 Tech Stack

- **Framework** - Next.js 15 with React 19
- **Runtime** - Bun
- **Styling** - Tailwind CSS 4
- **Markdown** - react-markdown + remark-gfm
- **Storage** - AWS S3
- **Security** - Rate limiting, encryption support

## 🔐 Security

- Server-side S3 access only
- Rate limiting (10 uploads/hour)
- Optional password protection
- Content validation & sanitization
- Secure edit keys for modifications

## 🙏 Acknowledgments

Built with [Next.js](https://nextjs.org/), [Tailwind CSS](https://tailwindcss.com/), [react-markdown](https://github.com/remarkjs/react-markdown), and [AWS S3](https://aws.amazon.com/s3/).
