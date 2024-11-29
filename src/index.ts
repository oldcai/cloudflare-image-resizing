/**
 * Fetch and log a request
 * @param {Request} request
 */
export default {
	async fetch(request: Request) {
	  // Parse request URL to get access to query string
	  let url = new URL(request.url)
  
	  // Cloudflare-specific options are in the cf object.
	  let options: { cf: { image: Record<string, string | number> } } = {
		cf: { image: {} }
	  }
  
	  // Copy parameters from query string to request options.
	  // You can implement various different parameters here.
	  options.cf.image.onerror = "redirect"
	  if (url.searchParams.has("fit")) options.cf.image.fit = url.searchParams.get("fit")
	  if (url.searchParams.has("width")) options.cf.image.width = url.searchParams.get("width")
	  if (url.searchParams.has("height")) options.cf.image.height = url.searchParams.get("height")
	  if (url.searchParams.has("quality")) options.cf.image.quality = url.searchParams.get("quality")
  
	  // Your Worker is responsible for automatic format negotiation. Check the Accept header.
	  const accept = request.headers.get("Accept");
	  if (/image\/avif/.test(accept)) {
		options.cf.image.format = 'avif';
	  } else if (/image\/webp/.test(accept)) {
		options.cf.image.format = 'webp';
	  }
  
	  // Get URL of the original (full size) image to resize.
	  // You could adjust the URL here, e.g., prefix it with a fixed address of your server,
	  // so that user-visible URLs are shorter and cleaner.
	  const imageURL = url.searchParams.get("image")
	  if (!imageURL) return new Response('Missing "image" value', { status: 400 })
  
	  try {
		// TODO: Customize validation logic
		const { hostname, pathname } = new URL(imageURL)
  
		// Get current domain from request
		const currentDomain = new URL(request.url).hostname
  
		// Extract root domain from both hostnames
		const getRootDomain = (hostname: string) => {
		  const parts = hostname.split('.')
		  return parts.slice(-2).join('.')
		}
  
		const sourceRootDomain = getRootDomain(hostname)
		const currentRootDomain = getRootDomain(currentDomain)
  
		// Check if domains match at root level
		if (sourceRootDomain !== currentRootDomain) {
		  return new Response(`Must use "${currentRootDomain}" or its subdomains`, { status: 403 })
		}
  
		// Check for disallowed path prefixes
		const disallowedPrefixes = ['/resize', '/image-resizing', '/thumb', '/thumbnail']
		if (disallowedPrefixes.some(prefix => pathname.toLowerCase().startsWith(prefix))) {
		  return new Response('Disallowed path prefix', { status: 400 })
		}
  
		// Optionally, only allow URLs with JPEG, PNG, GIF, or WebP file extensions
		// @see https://developers.cloudflare.com/images/url-format#supported-formats-and-limitations
		if (!/\.(jpe?g|png|gif|webp)$/i.test(pathname)) {
		  return new Response('Disallowed file extension', { status: 400 })
		}
	  } catch (err) {
		return new Response('Invalid "image" value', { status: 400 })
	  }
  
	  // Build a request that passes through request headers
	  const imageRequest = new Request(imageURL, {
		headers: request.headers
	  })
  
	  // Returning fetch() with resizing options will pass through response with the resized image.
	  return fetch(imageRequest, options)
	}
  }