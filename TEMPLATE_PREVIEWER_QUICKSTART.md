# Template Previewer - Quick Start Guide

## Installation

No installation needed! All files are already in place.

## Accessing the Previewer

### Development
```
http://localhost:3001/preview-template
```

### Production
```
https://yourdomain.com/preview-template
```

## How to Use

### 1. Open the Previewer
Navigate to `/preview-template` in your browser.

### 2. Select a Template
Use the dropdown at the top to choose from 13 templates:
- **PREMIUM** (7 templates): LAIA, Modern, Luxe, Elegance, Spa Luxe, Medical, Laser Tech
- **SOLO** (6 templates): Professional, Classic, Minimal, Fresh, Zen, Boutique

### 3. Customize Colors
Click the color pickers or enter hex codes:
- Primary Color
- Secondary Color
- Accent Color

Changes apply instantly to the preview!

### 4. Add Your Branding
- **Organization Name**: Your business name
- **Description**: Your tagline or description
- **Logo**: Upload your logo (max 2MB)

### 5. Customize Hero Section
- **Hero Title**: Custom title for the homepage
- **Hero Description**: Custom description
- **Hero Image**: Upload a hero image (max 5MB)
- **Hero Video**: Upload a hero video (max 20MB)

### 6. Add Contact Info
- Phone number
- Email address
- Physical address

### 7. Preview on Different Devices
Toggle between **Desktop** and **Mobile** views to see how your template looks on different devices.

### 8. Reset or Purchase
- Click **"Réinitialiser"** to reset all changes
- Click **"Commander ce design"** to proceed with purchase

## Adding to Your Pages

### Simple Link
```tsx
import Link from 'next/link';

<Link href="/preview-template">
  Prévisualiser les Templates
</Link>
```

### Using the Button Component
```tsx
import PreviewTemplateButton from '@/components/PreviewTemplateButton';

// Primary button (default)
<PreviewTemplateButton />

// Large secondary button
<PreviewTemplateButton
  variant="secondary"
  size="lg"
/>

// Outline button, opens in new tab
<PreviewTemplateButton
  variant="outline"
  openInNewTab={true}
/>

// Full width button
<PreviewTemplateButton
  fullWidth={true}
/>
```

## File Uploads

### Supported Formats
- **Logo**: JPG, PNG, WebP, SVG (max 2MB)
- **Hero Image**: JPG, PNG, WebP (max 5MB)
- **Hero Video**: MP4, WebM (max 20MB)

### How It Works
1. Click "Choose File"
2. Select your file
3. Preview appears instantly
4. File is stored temporarily in browser
5. On purchase, file is uploaded to server

## Cleanup

### Manual Cleanup
Remove temporary files older than 24 hours:

```bash
npm run cleanup:temp
```

### Automatic Cleanup (Recommended)

#### Linux/Mac (Cron)
```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 2 AM)
0 2 * * * cd /path/to/laia-skin-nextjs && npm run cleanup:temp
```

#### Windows (Task Scheduler)
1. Open Task Scheduler
2. Create Basic Task
3. Name: "Cleanup Temp Files"
4. Trigger: Daily at 2:00 AM
5. Action: Start a program
6. Program: `C:\Windows\System32\cmd.exe`
7. Arguments: `/c cd C:\path\to\laia-skin-nextjs && npm run cleanup:temp`

## Testing

### Test the Previewer
1. Visit `/preview-template`
2. Select each template
3. Change colors
4. Upload files
5. Test mobile view
6. Test reset button
7. Test purchase flow

### Test File Uploads
```bash
# Test upload endpoint
curl -X POST http://localhost:3001/api/preview/upload \
  -F "file=@/path/to/test-image.jpg"
```

### Test Cleanup Script
```bash
# Run cleanup manually
npm run cleanup:temp

# Check output for statistics
```

## Troubleshooting

### Issue: Preview not loading
**Solution**:
- Clear browser cache
- Check console for errors
- Verify all templates exist

### Issue: Colors not updating
**Solution**:
- Ensure hex codes are valid (#RRGGBB)
- Check browser supports color input
- Try refreshing the page

### Issue: Files not uploading
**Solution**:
- Check file size (logo: 2MB, image: 5MB, video: 20MB)
- Verify file format (see supported formats above)
- Check `public/temp/` directory exists and is writable

### Issue: "Commander ce design" not working
**Solution**:
- Check browser localStorage is enabled
- Verify onboarding route exists
- Check console for JavaScript errors

## Configuration

### Customize Purchase Flow

Edit `/src/app/(platform)/preview-template/page.tsx`:

```typescript
const handlePurchase = async (config: PreviewConfig) => {
  // Your custom logic here
  console.log('Configuration:', config);

  // Redirect to your checkout
  router.push(`/checkout?template=${config.templateId}`);
};
```

### Add More Templates

1. Create new template in `/src/components/templates/`
2. Add to TEMPLATES array in `/src/components/TemplatePreview.tsx`:

```typescript
const TEMPLATES: TemplateInfo[] = [
  // ... existing templates
  {
    id: 'mytemplate',
    name: 'My Template',
    tier: 'PREMIUM',
    component: TemplateMyTemplate,
    thumbnail: '/templates/mytemplate-thumb.jpg',
    defaultColors: {
      primary: '#000000',
      secondary: '#ffffff',
      accent: '#666666'
    }
  }
];
```

## Best Practices

### For Users
1. **Try multiple templates** before choosing
2. **Test on mobile** to see responsive design
3. **Upload high-quality images** for best results
4. **Use consistent colors** that match your brand
5. **Save configuration** before closing browser

### For Developers
1. **Monitor temp directory size** regularly
2. **Set up automated cleanup** immediately
3. **Test file uploads** with various formats
4. **Add rate limiting** to upload endpoint
5. **Monitor API performance** and errors
6. **Back up configurations** before template switches

## Support

Need help?

### Documentation
- **README**: `/TEMPLATE_PREVIEWER_README.md`
- **Integration Guide**: `/TEMPLATE_PREVIEWER_INTEGRATION.md`
- **Summary**: `/TEMPLATE_PREVIEWER_SUMMARY.md`

### Check Logs
```bash
# Browser console
Open DevTools > Console

# Server logs
Check terminal where `npm run dev` is running

# Cleanup logs
npm run cleanup:temp
```

### Common Questions

**Q: Can I save multiple configurations?**
A: Currently, only one configuration is saved in localStorage. Implement a database solution for multiple saves.

**Q: How long are uploaded files kept?**
A: Files are automatically deleted after 24 hours.

**Q: Can I customize the mock data?**
A: Yes! Edit MOCK_SERVICES and MOCK_TEAM in TemplatePreview.tsx.

**Q: Is this mobile-friendly?**
A: Yes! The previewer is fully responsive and works on all devices.

**Q: Can users share their preview?**
A: Not currently. This would require a backend to store configurations with unique URLs.

## Next Steps

1. **Test thoroughly** in development
2. **Deploy to production**
3. **Set up automated cleanup**
4. **Monitor usage analytics**
5. **Gather user feedback**
6. **Plan enhancements**

## Quick Reference

### URLs
- Previewer: `/preview-template`
- Upload API: `/api/preview/upload`

### Commands
```bash
npm run dev              # Start development server
npm run cleanup:temp     # Clean temporary files
```

### Components
```tsx
import TemplatePreview from '@/components/TemplatePreview';
import PreviewTemplateButton from '@/components/PreviewTemplateButton';
```

### File Limits
- Logo: 2MB
- Hero Image: 5MB
- Hero Video: 20MB

### Auto-Cleanup
Files deleted after: 24 hours

---

**That's it! You're ready to use the Template Previewer.**

For detailed documentation, see:
- `TEMPLATE_PREVIEWER_README.md`
- `TEMPLATE_PREVIEWER_INTEGRATION.md`
- `TEMPLATE_PREVIEWER_SUMMARY.md`
