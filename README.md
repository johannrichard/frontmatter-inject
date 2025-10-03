# Frontmatter Inject

## TL;DR:
Add frontmatter to your notes via URI links. Perfect for automation and external integrations. You can use it e.g. to add a `location` property to a note based on an [iOS Shortcut like this](https://www.icloud.com/shortcuts/bfea385338c64c2e9b55a683f2495897):

<img width="862" height="512" alt="image" src="https://github.com/user-attachments/assets/fbaf80f7-ffee-4c72-a97a-f3b046e90b04" />

You can then use a plugin of your choice to add a command like the following which will open the Shortcut above, grabs the location, and returns to Obsidian to add the location as a new / updated property:

```
shortcuts://run-shortcut?name=Add%20Frontmatter%20Location
```

## Features

- **URI-based frontmatter injection**: Add metadata to notes through simple URI calls
- **Security controls**: Define which frontmatter keys are allowed
- **Flexible configuration**: Allow all keys or restrict to a specific whitelist
- **External integration**: Perfect for iOS Shortcuts, Alfred workflows, Raycast scripts, and other automation tools

## Usage

Call the plugin using the `obsidian://` URI scheme:

```
obsidian://frontmatter-inject?key=author&value=John%20Doe
obsidian://frontmatter-inject?key=status&value=draft
obsidian://frontmatter-inject?key=tags&value=important
```

The plugin will add or update the specified frontmatter key in the currently active note.

### Parameters

- `key`: The frontmatter key to add (required)
- `value`: The value to set (required, URL-encoded)

### Example integrations

**iOS Shortcuts (Geolocation):**

Create a shortcut that captures your current location and adds it to your active note:

1. Add „Get Current Location“ action
2. Add „Open URL“ action with:
```
obsidian://frontmatter-inject?key=location&value=[Latitude],[Longitude]
```

This will add frontmatter like:
```yaml
—
location: 47.3769,8.5417
—
```

**iOS Shortcuts (Simple):**
```
Open URL: obsidian://frontmatter-inject?key=created&value=2024-10-03
```

**Alfred Workflow:**
```bash
open „obsidian://frontmatter-inject?key=status&value=in-progress“
```

**Raycast Script:**
```javascript
open(„obsidian://frontmatter-inject?key=author&value=John%20Doe“);
```

## Settings

### Allow all keys
Toggle to permit any frontmatter key via URI. When disabled, only keys from the allowed list are accepted.

### Allowed frontmatter keys
Comma-separated list of permitted keys (e.g., `author,status,tags,date,category,location`). Only applies when „Allow all keys“ is disabled.

## Installation

### From Obsidian Community Plugins (Once added)
1. Open Settings → Community plugins
2. Search for „Frontmatter inject“
3. Click Install, then Enable

### Using BRAT (Beta Reviewers Auto-update Tester)
1. Install the [BRAT plugin](https://github.com/TfTHacker/obsidian42-brat)
2. Open BRAT settings
3. Click „Add Beta plugin“
4. Enter: `johannrichard/obsidian-frontmatter-inject`
5. Enable the plugin in Settings → Community plugins

### Manual Installation
1. Download `main.js`, `manifest.json`, and `styles.css` from the latest release
2. Create a folder `frontmatter-inject` in your vault’s `.obsidian/plugins/` directory
3. Copy the files into the folder
4. Reload Obsidian and enable the plugin in Settings

## Security

For security, the plugin sanitizes all input:
- Keys are restricted to alphanumeric characters, hyphens, and underscores
- Values are URL-decoded and trimmed
- Only allowed keys (per settings) can be added

## Support

Found a bug or have a feature request? [Open an issue on GitHub](https://github.com/johannrichard/frontmatter-inject/issues).

—

Made with ☕ by [johannrichard](https://github.com/johannrichard)
