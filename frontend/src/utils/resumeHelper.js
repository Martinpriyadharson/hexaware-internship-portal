/**
 * Resume Utility Helper for Secure Intern Examination Portal
 * Handles viewing Base64 DataURLs in a new tab and downloading files cleanly.
 */

export const getResumeFileName = (candidate) => {
  if (!candidate) return 'Resume.pdf';
  if (candidate.resumeName && candidate.resumeName.trim()) {
    return candidate.resumeName;
  }
  const cleanName = candidate.name ? candidate.name.trim().replace(/\s+/g, '_') : 'Candidate';
  return `${cleanName}_Resume.pdf`;
};

export const openResumeInNewTab = (resumeUrl, fileName = 'Resume.pdf') => {
  if (!resumeUrl) return;

  try {
    // Check if it's a Base64 DataURL
    if (resumeUrl.startsWith('data:')) {
      const parts = resumeUrl.split(';base64,');
      const contentType = parts[0].replace('data:', '') || 'application/pdf';
      const base64Data = parts[1];

      const byteCharacters = atob(base64Data);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }

      const blob = new Blob(byteArrays, { type: contentType });
      const blobUrl = URL.createObjectURL(blob);
      
      const newTab = window.open(blobUrl, '_blank');
      if (!newTab) {
        // Fallback if popup blocker intervenes
        const a = document.createElement('a');
        a.href = blobUrl;
        a.target = '_blank';
        a.click();
      }
    } else {
      window.open(resumeUrl, '_blank');
    }
  } catch (err) {
    console.error('Error opening resume document in new tab:', err);
    window.open(resumeUrl, '_blank');
  }
};

export const downloadResumeFile = (resumeUrl, fileName = 'Candidate_Resume.pdf') => {
  if (!resumeUrl) return;

  try {
    const link = document.createElement('a');
    link.href = resumeUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Error downloading resume document:', err);
  }
};
