import * as chrono from 'chrono-node';

export interface ParsedTask {
  text: string;
  dueTime?: number;
}

export function parseNaturalLanguage(input: string): ParsedTask {
  // Parse the input for dates and times
  const results = chrono.parse(input);
  
  if (results.length === 0) {
    // No time found, return original text
    return { text: input.trim() };
  }

  // Get the first (most confident) result
  const result = results[0];
  const dueTime = result.start.date().getTime();
  
  // Remove the time phrase from the text
  const beforeTime = input.substring(0, result.index).trim();
  const afterTime = input.substring(result.index + result.text.length).trim();
  
  // Combine the parts, removing common prepositions
  let cleanText = (beforeTime + ' ' + afterTime).trim();
  
  // Clean up common time prepositions
  cleanText = cleanText
    .replace(/\s+at\s*$/, '')
    .replace(/^at\s+/, '')
    .replace(/\s+in\s*$/, '')
    .replace(/^in\s+/, '')
    .replace(/\s+on\s*$/, '')
    .replace(/^on\s+/, '')
    .replace(/\s+by\s*$/, '')
    .replace(/^by\s+/, '')
    .trim();

  return {
    text: cleanText || input.trim(),
    dueTime
  };
}

// Examples of what this can parse:
// "Submit report at 3pm" -> { text: "Submit report", dueTime: today at 3pm }
// "Buy groceries tomorrow at 7pm" -> { text: "Buy groceries", dueTime: tomorrow at 7pm }
// "Call mom in 1 hour" -> { text: "Call mom", dueTime: 1 hour from now }
// "Meeting next Tuesday at 2:30pm" -> { text: "Meeting", dueTime: next Tuesday at 2:30pm }
