# Cloudflare Image Resizing (Transform via Workers)

Transform and optimize images through Cloudflare Workers to significantly reduce loading times and bandwidth usage.

## Performance Impact
- Implemented for [Flux Image](https://flux-image.com)
- Reduced image loading time by 80% 
- Decreased load times from 1000ms+ to ~50ms per image

## Configuration
1. Configure Cache Rules for optimal performance:
  - Go to Rules > Cache Rules
  - Select "Cache Default File Extensions" 
  - Create a new rule

2. Set up Worker Route:
  - Navigate to Settings > Domains & Routes
  - Add Route with value: `{yourdomain.com}/resize*`

The caching configuration is critical - without proper cache rules, image transformations can take over 1 second. With caching enabled, response times drop to tens of milliseconds.

