export function convertUTCToLocal(utcDateString: string): string {
  // Create a Date object from the UTC string
  const date: Date = new Date(utcDateString);

  // Get local date components
  const day: string = String(date.getDate()).padStart(2, "0");
  const month: string = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year: number = date.getFullYear();

  // Get local time components
  let hours: number = date.getHours();
  const minutes: string = String(date.getMinutes()).padStart(2, "0");
  const ampm: string = hours >= 12 ? "PM" : "AM";

  // Convert to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // Handle midnight (0 hours)

  // Format the result
  return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
}

// Example usage:
// const utcDate: string = "2025-03-16T05:13:33.915Z";
// console.log(convertUTCToLocal(utcDate));
// Output will vary based on system timezone, e.g., "16/03/2025 5:13 AM" (UTC)
// or "16/03/2025 10:13 AM" (UTC+5)

export const formatTime = (time: string): string => {
  // Create Date object and check if it's valid
  const date = new Date(time);
  if (isNaN(date.getTime())) {
    return "Invalid Date"; // Handle invalid input gracefully
  }

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
};

// Example usage:
// const utcTime = "2025-03-16T05:13:33.915Z";
// console.log(formatTime(utcTime)); // e.g., "Mar 16" or "05:13" if today matches

// // Test with invalid input
// console.log(formatTime("invalid")); // "Invalid Date"