import { type App, Notice, Plugin, PluginSettingTab, Setting, type TFile } from 'obsidian';
import { escapeProperty } from './helper/frontmatter-utils';

interface FrontmatterInjectSettings {
  allowedKeys: string;
  allowAllKeys: boolean;
}

const DEFAULT_SETTINGS: FrontmatterInjectSettings = {
  allowedKeys: 'author,status,tags,date,category,location',
  allowAllKeys: false,
};

export default class FrontmatterInjectPlugin extends Plugin {
  settings: FrontmatterInjectSettings;

  async onload() {
    await this.loadSettings();

    // Register the URI protocol handler using the plugin ID
    this.registerObsidianProtocolHandler('frontmatter-inject', async (params) => {
      await this.handleAddFrontmatter(params);
    });

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new FrontmatterInjectSettingTab(this.app, this));
  }

  async handleAddFrontmatter(params: Record<string, string>) {
    const { key, value } = params;

    // Validate parameters
    if (!key || !value) {
      new Notice('Both "key" and "value" parameters are required');
      return;
    }

    // Get the active file
    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile) {
      new Notice('No active note found');
      return;
    }

    // Sanitize key and value
    const sanitizedKey = this.sanitizeKey(key);
    const sanitizedValue = this.sanitizeValue(value);

    if (!sanitizedKey) {
      new Notice('Invalid key format');
      return;
    }

    // Check if key is allowed
    if (!this.isKeyAllowed(sanitizedKey)) {
      new Notice(`Key "${sanitizedKey}" is not in the allowed list. Check plugin settings.`);
      return;
    }

    // Add frontmatter using the proper API
    await this.addFrontmatter(activeFile, sanitizedKey, sanitizedValue);
    new Notice(`Added frontmatter: ${sanitizedKey}: ${sanitizedValue}`);
  }

  sanitizeKey(key: string): string {
    // Remove special characters, keep only alphanumeric, hyphens, and underscores
    return key.trim().replace(/[^a-zA-Z0-9_-]/g, '');
  }

  sanitizeValue(value: string): string {
    // Decode URI component and trim
    try {
      return escapeProperty(decodeURIComponent(value).trim());
    } catch (e) {
      console.error('Error decoding and sanitizing value:', e);
      return value.trim();
    }
  }

  isKeyAllowed(key: string): boolean {
    // If all keys are allowed, return true
    if (this.settings.allowAllKeys) {
      return true;
    }

    // Parse allowed keys from settings
    const allowedKeys = this.settings.allowedKeys
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    return allowedKeys.includes(key);
  }

  async addFrontmatter(file: TFile, key: string, value: string): Promise<void> {
    await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
      frontmatter[key] = value;
    });
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class FrontmatterInjectSettingTab extends PluginSettingTab {
  plugin: FrontmatterInjectPlugin;

  constructor(app: App, plugin: FrontmatterInjectPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: 'Frontmatter inject settings' });

    containerEl.createEl('p', {
      text: "This plugin allows you to inject frontmatter into your notes via URI commands. Perfect for automation and quick updates to your notes' metadata.",
    });

    const linkDiv = containerEl.createEl('div', { cls: 'frontmatter-inject-docs' });
    linkDiv.createEl('a', {
      text: 'View documentation on GitHub',
      href: 'https://github.com/johannrichard/frontmatter-inject#readme',
    });
    linkDiv.createEl('br');
    linkDiv.createEl('br');

    new Setting(containerEl)
      .setName('Allow all keys')
      .setDesc(
        'If enabled, any key can be added via URI. If disabled, only keys in the allowed list below will be accepted.'
      )
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.allowAllKeys).onChange(async (value) => {
          this.plugin.settings.allowAllKeys = value;
          await this.plugin.saveSettings();
          this.display(); // Refresh to show/hide the allowed keys setting
        })
      );

    if (!this.plugin.settings.allowAllKeys) {
      new Setting(containerEl)
        .setName('Allowed frontmatter keys')
        .setDesc('Comma-separated list of allowed frontmatter keys (e.g., author,status,tags,date)')
        .addTextArea((text) =>
          text
            .setPlaceholder('author,status,tags,date,category')
            .setValue(this.plugin.settings.allowedKeys)
            .onChange(async (value) => {
              this.plugin.settings.allowedKeys = value;
              await this.plugin.saveSettings();
            })
        );
    }
  }
}
