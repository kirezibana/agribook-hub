/**
 * Utility functions for handling image paths
 */

/**
 * Converts a local file path to a web-accessible URL
 * @param imagePath - The image path from the backend
 * @returns A properly formatted URL for the browser
 */
export function formatImagePath(imagePath: string | null | undefined): string {
  if (!imagePath) {
    // Return a default placeholder image if no path is provided
    return 'https://placehold.co/400x300?text=No+Image';
  }

  // Check if it's already a web URL (starts with http://, https://, or data:)
  if (
    imagePath.startsWith('http://') ||
    imagePath.startsWith('https://') ||
    imagePath.startsWith('data:')
  ) {
    return imagePath;
  }

  // Check if it's already a relative path that starts with /
  if (imagePath.startsWith('/')) {
    return imagePath;
  }

  // Check if it looks like a local Windows path (contains drive letter followed by colon)
  if (/^[A-Za-z]:/.test(imagePath)) {
    // Extract filename from the local path and provide a placeholder
    const fileName = imagePath.split('\\').pop()?.split('/').pop(); // Handle both separators
    if (fileName) {
      // Since we can't directly access local files from the browser,
      // we'll return a placeholder that indicates the original filename
      return `https://placehold.co/400x300?text=${encodeURIComponent(fileName)}`;
    }
  }

  // Check if it looks like a local Unix/Linux path (starts with / but not web-accessible)
  if (imagePath.startsWith('/') && !imagePath.includes('http')) {
    // For Unix-style paths, extract the filename
    const fileName = imagePath.split('/').pop();
    if (fileName) {
      return `https://placehold.co/400x300?text=${encodeURIComponent(fileName)}`;
    }
  }

  // If none of the above conditions match, return as is
  // (might be a relative path that's already web-accessible)
  return imagePath;
}

/**
 * Validates if an image URL is accessible
 * @param url - The image URL to validate
 * @returns Promise<boolean> indicating if the image is accessible
 */
export async function isValidImageUrl(url: string): Promise<boolean> {
  if (!url) return false;
  
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok && response.headers.get('Content-Type')?.startsWith('image/');
  } catch {
    return false;
  }
}

