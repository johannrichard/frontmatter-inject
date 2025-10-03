/**
 * FrontmatterUtils.ts
 */

import type { YamlEscapeOptions, YamlStringState } from 'src/types';

/**
 * Analyzes a string for YAML frontmatter characteristics
 * @param value - String to analyze
 * @returns Analysis of string characteristics
 */
function analyzeString(value: string): YamlStringState {
  if (!value) {
    return {
      hasSingleQuotes: false,
      hasDoubleQuotes: false,
      isValueEscapedAlready: false,
    };
  }

  return {
    hasSingleQuotes: value.includes("'"),
    hasDoubleQuotes: value.includes('"'),
    isValueEscapedAlready: isStringEscaped(value),
  };
}

/**
 * Checks if a string is already escaped
 * @param value - String to check
 */
function isStringEscaped(value: string): boolean {
  if (value.length <= 1) return false;
  return (value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'));
}

/**
 * Handles multiline string formatting
 * @param value - String to format
 * @returns Formatted multiline string
 */
function formatMultilineString(value: string): string {
  const indent = '  ';
  return `>-\n${indent}${value.replace(/\n/g, `\n${indent}`)}`;
}

/**
 * Escapes a value for YAML frontmatter
 * @param value - Value to escape
 * @param options - Escape options
 */
function escapeValue(value: string, { multiline = false, quoteStrings = false }: YamlEscapeOptions = {}): string {
  if (!value) return '""';
  if (analyzeString(value).isValueEscapedAlready) return value;

  if (value.includes('\n') && multiline) {
    return formatMultilineString(value);
  }

  const cleanValue = normalizeString(value);
  return quoteStrings ? quoteString(cleanValue) : cleanValue;
}

/**
 * Normalizes a string by cleaning whitespace
 */
function normalizeString(value: string): string {
  return value.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Applies appropriate quoting to a string
 */
function quoteString(value: string): string {
  const state = analyzeString(value);

  if (!state.hasSingleQuotes && !state.hasDoubleQuotes) {
    return `"${value}"`;
  }

  if (state.hasDoubleQuotes && !state.hasSingleQuotes) {
    return `'${value}'`;
  }

  if (state.hasSingleQuotes && !state.hasDoubleQuotes) {
    return `"${value}"`;
  }

  return `"${value.replace(/"/g, '\\"')}"`;
}

export function escapeProperty(value: string, quoteStrings = false): string {
  const escapeStringValue = (str: string) => escapeValue(str, { quoteStrings });
  let processedProperty: unknown;
  if (Array.isArray(value)) {
    (processedProperty as unknown) = value.map((item) => (typeof item === 'string' ? escapeValue(item) : item));
  } else if (typeof value === 'string') {
    (processedProperty as unknown) = escapeStringValue(value);
  }
  return processedProperty as string;
}
