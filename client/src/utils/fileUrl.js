export const getFileUrl = (url) => {
  if (!url) return '#';
  // If it's a Cloudinary URL (starts with http) or already an absolute URL, return as is
  if (url.startsWith('http')) return url;
  
  // Otherwise, it's a legacy local upload, prepend the API base URL
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  
  // Ensure the relative path starts with a slash
  const relativePath = url.startsWith('/') ? url : `/${url}`;
  
  return `${baseUrl}${relativePath}`;
};
