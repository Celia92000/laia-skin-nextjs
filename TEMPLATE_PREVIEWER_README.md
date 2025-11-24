# Template Previewer System

A comprehensive real-time template customization and preview system that allows clients to customize and preview all 13 available templates before purchasing.

## Features

### Control Panel (Left 30%)
1. **Template Selection**
   - Dropdown to switch between all 13 templates
   - Template tier display (SOLO/PREMIUM)
   - Instant template switching

2. **Color Customization (Real-time)**
   - Primary Color picker
   - Secondary Color picker
   - Accent Color picker
   - Reset to default colors button
   - Visual color preview
   - Hex code input

3. **Branding**
   - Organization name input
   - Description/tagline textarea
   - Logo upload (max 2MB, jpg/png/webp/svg)
   - Instant logo preview
   - Delete uploaded files

4. **Hero Section**
   - Hero title input
   - Hero description textarea
   - Hero image upload (max 5MB, jpg/png/webp)
   - Hero video upload (max 20MB, mp4/webm)
   - Instant media preview
   - Delete uploaded media

5. **Contact Information**
   - Phone number input
   - Email input
   - Address textarea

6. **Action Buttons**
   - "Réinitialiser" - Reset all to defaults
   - "Commander ce design" - Purchase/continue CTA

### Live Preview (Right 70%)
- Real-time rendering of selected template
- All changes immediately reflected
- Scrollable preview area
- Device view toggle (Desktop/Mobile)
- Responsive preview scaling
- Full template functionality

## Available Templates

### PREMIUM Tier (7 templates)
1. **LAIA** - Rose gold elegance
2. **Modern** - Futuristic cyberpunk
3. **Luxe** - Golden luxury
4. **Elegance** - Sophisticated brown tones
5. **Spa Luxe** - Calming teal
6. **Medical** - Professional blue
7. **Laser Tech** - High-tech neon

### SOLO Tier (6 templates)
8. **Professional** - Corporate blue-gray
9. **Classic** - Traditional beige
10. **Minimal** - Clean black & white
11. **Fresh** - Vibrant green
12. **Zen** - Natural sage
13. **Boutique** - Feminine pink

## File Structure

```
/src
  /components
    TemplatePreview.tsx           # Main component
  /app
    /(platform)
      /preview-template
        page.tsx                   # Preview page
    /api
      /preview
        /upload
          route.ts                 # File upload API
/scripts
  cleanup-temp-files.ts           # Cleanup script
/public
  /temp                           # Temporary uploads (gitignored)
```

## Usage

### 1. Access the Preview Page

Navigate to: `http://localhost:3001/preview-template`

Or in production: `https://yourdomain.com/preview-template`

### 2. Customize Your Template

**Select a Template:**
- Use the dropdown to choose from 13 templates
- See the tier (SOLO/PREMIUM) displayed

**Customize Colors:**
- Click color pickers to choose colors
- Or enter hex codes manually
- Click "Reset" to restore default colors

**Add Branding:**
- Enter your organization name
- Add a tagline/description
- Upload your logo (instant preview)

**Customize Hero Section:**
- Add custom hero title and description
- Upload hero image or video
- Preview media instantly

**Add Contact Info:**
- Enter phone, email, and address
- See them appear in real-time on the preview

### 3. View on Different Devices

- Toggle between Desktop and Mobile views
- Preview scales responsively
- Scroll to see full template

### 4. Purchase

- Click "Commander ce design"
- Configuration is saved to localStorage
- Redirects to onboarding/checkout with template ID

## API Endpoints

### POST /api/preview/upload
Upload temporary files (images/videos)

**Request:**
```javascript
const formData = new FormData();
formData.append('file', fileObject);

fetch('/api/preview/upload', {
  method: 'POST',
  body: formData
});
```

**Response:**
```json
{
  "success": true,
  "url": "/temp/1234567890-abc123.jpg",
  "filename": "1234567890-abc123.jpg",
  "size": 123456,
  "type": "image/jpeg"
}
```

**Validation:**
- Images: max 5MB (jpg, png, webp, svg)
- Videos: max 20MB (mp4, webm)
- Logo: max 2MB

### GET /api/preview/upload
Check/create temp directory

### DELETE /api/preview/upload?filename=xxx
Delete a specific temp file

## File Management

### Temporary Files
- Uploaded files are stored in `public/temp/`
- Files are NOT uploaded to server immediately
- Client-side preview uses `URL.createObjectURL()`
- Only uploaded on purchase confirmation

### Cleanup Script

**Manual Cleanup:**
```bash
npm run cleanup:temp
```

**Automated Cleanup:**
Files older than 24 hours are automatically cleaned up.

**Schedule with Cron (Linux/Mac):**
```bash
# Edit crontab
crontab -e

# Add line to run daily at 2 AM
0 2 * * * cd /path/to/project && npm run cleanup:temp
```

**Schedule with Task Scheduler (Windows):**
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger: Daily at 2:00 AM
4. Action: Start a program
5. Program: `cmd.exe`
6. Arguments: `/c cd /path/to/project && npm run cleanup:temp`

## Configuration Object

When user clicks "Commander ce design", the configuration is saved:

```typescript
interface PreviewConfig {
  templateId: string;           // 'laia', 'modern', etc.
  organizationName: string;     // Organization name
  description: string;          // Tagline/description
  primaryColor: string;         // Hex color
  secondaryColor: string;       // Hex color
  accentColor: string;          // Hex color
  logoUrl?: string;             // Logo URL
  heroImage?: string;           // Hero image URL
  heroVideo?: string;           // Hero video URL
  heroTitle?: string;           // Custom hero title
  heroDescription?: string;     // Custom hero description
  phone?: string;               // Contact phone
  email?: string;               // Contact email
  address?: string;             // Contact address
}
```

## Integration Points

### 1. Onboarding Flow
```typescript
// In preview page
const handlePurchase = (config: PreviewConfig) => {
  localStorage.setItem('templateConfig', JSON.stringify(config));
  router.push(`/onboarding?template=${config.templateId}`);
};
```

### 2. Checkout Flow
```typescript
// In checkout page
const config = JSON.parse(localStorage.getItem('templateConfig') || '{}');
// Use config to pre-fill organization settings
```

### 3. Admin Panel
```typescript
// Save template configuration to database
const org = await prisma.organization.update({
  where: { id: organizationId },
  data: {
    templateId: config.templateId,
    primaryColor: config.primaryColor,
    secondaryColor: config.secondaryColor,
    accentColor: config.accentColor,
    // ... other fields
  }
});
```

## Security Considerations

1. **File Validation**
   - File type validation (server-side)
   - File size limits enforced
   - Filename sanitization

2. **Temporary Storage**
   - Files stored in isolated temp directory
   - Automatic cleanup after 24 hours
   - No permanent storage until purchase

3. **Path Traversal Prevention**
   - Filenames sanitized
   - No parent directory access
   - Restricted to temp directory only

4. **Rate Limiting**
   - Consider adding rate limits to upload endpoint
   - Prevent abuse of temp storage

## Performance Optimizations

1. **Dynamic Imports**
   - Templates loaded dynamically
   - Reduces initial bundle size
   - Faster page load

2. **Client-Side Preview**
   - Uses `URL.createObjectURL()`
   - Instant preview without server upload
   - Uploads only on purchase

3. **Image Optimization**
   - Next.js Image component
   - Automatic optimization
   - Lazy loading

## Responsive Design

- **Desktop (lg+)**: Split 30/70 layout
- **Mobile/Tablet**: Stacked layout
- **Preview Scaling**: Automatic responsive scaling
- **Touch Support**: Full touch interaction support

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support

## Troubleshooting

### Files not uploading
- Check file size limits
- Verify file type (only jpg/png/webp/svg/mp4/webm)
- Check temp directory permissions

### Preview not updating
- Check browser console for errors
- Clear browser cache
- Verify template component exports

### Cleanup script not running
- Check file permissions: `chmod +x scripts/cleanup-temp-files.ts`
- Verify cron job setup
- Check script logs

## Future Enhancements

- [ ] Real-time collaboration (multiple users)
- [ ] Template comparison view
- [ ] Save draft configurations
- [ ] Share preview link with others
- [ ] Export configuration as JSON
- [ ] Import configuration from JSON
- [ ] A/B testing different configurations
- [ ] Analytics on popular customizations

## Support

For issues or questions:
1. Check console for error messages
2. Verify all dependencies installed
3. Check file permissions
4. Review API endpoint logs

## License

Part of LAIA Connect - All Rights Reserved
