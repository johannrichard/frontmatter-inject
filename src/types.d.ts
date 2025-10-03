export interface YamlStringState {
  hasSingleQuotes: boolean;
  hasDoubleQuotes: boolean;
  isValueEscapedAlready: boolean;
}

export interface YamlEscapeOptions {
  multiline?: boolean;
}
