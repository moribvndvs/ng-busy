## 2.0

### Breaking Changes

* #3 All `busy-when-name`/`not-busy-when-name`/`busy-when-url`/`not-busy-when-url` values are considered regex patterns to facilitate easier and more flexible configuration. Be mindful about whether or not the values you're currently using will match differently as regex patterns. If you want to quickly modify your markup to ensure the values you had working before (example: `busy-when-url="/api/things"`), add the regex beginning of line and end of line characters to cause a strict match (previous example becomes: `busy-when-url="^/api/things$"`).
