// MEMEX-Reel Detection & Extraction Logic

import type { EntryType, ChecklistItem } from '@/types/entry';

/**
 * Detects if text should be a checklist or note
 * Simple heuristics - no NLP, just fast regex
 */
export function detectType(rawText: string): EntryType {
  const text = rawText.trim();
  
  // Pattern 1: Explicit list markers (-, *, •, numbers)
  const listMarkerPattern = /^[\s]*[-*•]\s+.+/m;
  const numberedPattern = /^[\s]*\d+[.)]\s+.+/m;
  
  // Pattern 2: Comma-separated items (3+ items)
  const commaItems = text.split(',').map(s => s.trim()).filter(Boolean);
  const hasMultipleCommaItems = commaItems.length >= 3 && 
    commaItems.every(item => item.length > 0 && item.length < 50);
  
  // Pattern 3: Line-separated short items
  const lines = text.split('\n').map(s => s.trim()).filter(Boolean);
  const hasMultipleShortLines = lines.length >= 2 && 
    lines.every(line => line.length < 100);
  
  // Pattern 4: Keywords suggesting list
  const listKeywords = /\b(acheter|buy|todo|faire|get|prendre|apporter|list|liste)\b/i;
  const hasListKeyword = listKeywords.test(text);
  
  // Decision logic
  if (listMarkerPattern.test(text) || numberedPattern.test(text)) {
    return 'checklist';
  }
  
  if (hasMultipleCommaItems) {
    return 'checklist';
  }
  
  if (hasMultipleShortLines && hasListKeyword) {
    return 'checklist';
  }
  
  // Default to note
  return 'note';
}

/**
 * Extracts checklist items from text
 */
export function extractItems(rawText: string): ChecklistItem[] {
  const text = rawText.trim();
  let items: string[] = [];
  
  // Try list markers first
  const listMarkerPattern = /^[\s]*[-*•]\s+(.+)/gm;
  const numberedPattern = /^[\s]*\d+[.)]\s+(.+)/gm;
  
  let match;
  const markerItems: string[] = [];
  
  while ((match = listMarkerPattern.exec(text)) !== null) {
    markerItems.push(match[1].trim());
  }
  
  while ((match = numberedPattern.exec(text)) !== null) {
    markerItems.push(match[1].trim());
  }
  
  if (markerItems.length > 0) {
    items = markerItems;
  } else {
    // Try comma separation
    const commaItems = text.split(',').map(s => s.trim()).filter(Boolean);
    
    if (commaItems.length >= 2) {
      items = commaItems;
    } else {
      // Try line separation
      const lineItems = text.split('\n').map(s => s.trim()).filter(Boolean);
      
      if (lineItems.length >= 2) {
        items = lineItems;
      } else {
        // Single item
        items = [text];
      }
    }
  }
  
  // Clean and return as ChecklistItems
  return items
    .map(label => label.replace(/^[-*•\d.)]+\s*/, '').trim())
    .filter(label => label.length > 0)
    .map(label => ({
      label,
      checked: false
    }));
}
