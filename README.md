# Reddit Version Chooser Extension

## Description

The Reddit Version Chooser is a browser extension that allows you to consistently use a specific version of Reddit: the old version, the new version, or the latest "New New" version. This is particularly useful as Reddit transitions between different versions, ensuring you have a consistent browsing experience.

## Features

- Choose between `www.reddit.com`, `new.reddit.com`, or `old.reddit.com`.
- Automatically redirects Reddit pages to your chosen version.
- Handles special URLs like modmail and media links without redirecting them.
- Retry logic to handle intermittent loading issues.
- User notification for failed loading attempts.

## Installation

1. Clone the repository to your local machine:

    ```sh
    git clone https://github.com/yourusername/reddit-version-chooser.git
    ```

2. Open your browser's extensions page:
    - For Chrome: `chrome://extensions/`
    - For Edge: `edge://extensions/`
3. Enable "Developer mode" using the toggle in the top right corner.
4. Click "Load unpacked" and select the directory where you cloned the repository.

## Usage

1. Click on the Reddit Version Chooser extension icon in your browser toolbar.
2. Choose your preferred version of Reddit by clicking one of the buttons (`New New Reddit`, `New Reddit`, `Old Reddit`).
3. The extension will automatically redirect Reddit pages to the selected version.

## Development

### Project Structure

- `manifest.json`: Configuration file for the browser extension.
- `background.js`: Handles background tasks, including redirect rules and retry logic.
- `popup.html`: The HTML for the extension's popup interface.
- `popup.js`: The JavaScript logic for the popup interface.

### Updating the Extension

To update the extension with new changes:

1. Make your changes to the code.
2. Reload the extension in the browser's extensions page.

### Handling Special Cases

- Modmail URLs (e.g., `https://mod.reddit.com/mail/all`) and media URLs (e.g., `https://www.reddit.com/media`) are excluded from redirection to ensure proper functionality.

## Known Issues

- Due to Reddit's ongoing transition between different versions, there may be occasional loading issues. The extension includes retry logic to mitigate this, but some issues may persist.

## Contributing

Contributions are welcome! If you have suggestions for improvements or encounter any issues, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- Thanks to the developers and contributors of the tools and libraries used in this project.
- Special thanks to the Reddit community for providing feedback and inspiration.
