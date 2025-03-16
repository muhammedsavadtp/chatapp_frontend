import { useState, useEffect } from "react";

// Custom hook to handle media queries
export const useMediaQuery = (query: string): boolean => {
  // Check if we're in a browser environment (for SSR compatibility)
  const isClient = typeof window === "object";

  // Function to get the initial match state
  const getMatches = (query: string): boolean => {
    return isClient ? window.matchMedia(query).matches : false;
  };

  const [matches, setMatches] = useState<boolean>(getMatches(query));

  useEffect(() => {
    if (!isClient) return;

    const mediaQuery = window.matchMedia(query);
    const handleChange = (event: MediaQueryListEvent) =>
      setMatches(event.matches);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Add listener for changes
    mediaQuery.addEventListener("change", handleChange);

    // Cleanup listener on unmount
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [query, isClient]);

  return matches;
};

export default useMediaQuery;
