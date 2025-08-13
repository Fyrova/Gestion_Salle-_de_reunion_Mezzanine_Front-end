// Font configuration with fallback for Docker builds
export const fontConfig = {
  montserrat: {
    fallback: ['system-ui', 'Arial', 'sans-serif'],
    google: {
      subsets: ['latin'],
      display: 'swap',
    }
  }
};

// Helper function to handle font loading with fallback
export const getFontClass = (fontName, isDockerBuild = false) => {
  if (isDockerBuild) {
    return fontConfig[fontName]?.fallback?.join(', ') || 'sans-serif';
  }
  return fontName;
};
