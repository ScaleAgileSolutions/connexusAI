
# React Chat Widget

A customizable chat widget that integrates with Retell AI for real-time voice conversations.

## License

**ISC License**

## Version

**1.0.0**

---

## Installation

1. **Add the script to your HTML:**
   ```html
   <script src="https://chat-homelifeshield.pages.dev/chat-widget.js"></script>
   ```

2. **Initialize the widget:**
   ```js
   window.ChatWidget.init({
     apiKey: 'your-retell-api-key',
     agentId: 'your-agent-id',
     agentName: 'Agent Name',
     sourceId: 'your-source-id',
     onSite: false, // Set to true for internal testing
     userId: 'optional-user-id',
     widgetId: 'optional-widget-id'
   });
   ```

### Configuration Options

| Option      | Type    | Required | Description                              |
|-------------|---------|----------|------------------------------------------|
| apiKey      | string  | Yes      | Your Retell AI API key                   |
| agentId     | string  | Yes      | ID of the agent to connect to            |
| agentName   | string  | Yes      | Display name of the agent                |
| sourceId    | string  | Yes      | Identifier for the source of the call    |
| onSite      | boolean | No       | Set to true for internal testing         |
| userId      | string  | No       | Optional user identifier                 |
| widgetId    | string  | No       | Optional widget identifier               |

---

## Removal

1. Remove the script tag from your HTML.
2. Remove any initialization code.
3. Clean up any stored data:
   ```js
   localStorage.removeItem('chat-widget-data');
   ```

---

## Troubleshooting

### Common Issues

- **Widget Not Loading**
  - Check if the script URL is accessible.
  - Verify CORS settings on your server.
  - Check browser console for errors.

- **Call Connection Issues**
  - Verify API key and agent ID.
  - Check microphone permissions.
  - Ensure stable internet connection.
  - Check browser compatibility.

- **Transfer Not Working**
  - Verify transfer agent ID is configured.
  - Check network connectivity.
  - Ensure proper cleanup of previous call.

- **Audio Issues**
  - Check microphone permissions.
  - Verify audio device selection.
  - Check browser audio settings.

### Error Messages

| Error                                      | Solution                                             |
|--------------------------------------------|------------------------------------------------------|
| UnexpectedConnectionState                  | Wait for previous call to end, refresh page          |
| Cannot find name 'trackingData'            | Check initialization order                           |
| destroy is not a function                  | Ensure proper cleanup in component unmount           |
| Type 'string \| number' is not assignable  | Check data type conversions                          |

---

## Features

### Current Features

- Real-time voice conversations with AI agents
- Call transfer capabilities
- User data collection
- Call tracking and analytics
- Hold music during transfers
- Device and connection information tracking
- Permission management
- Mobile-responsive design

### Recent Updates

- Added call transfer functionality
- Implemented hold music during transfers
- Enhanced user data collection
- Added connection state handling
- Improved error handling and recovery
- Added call tracking and analytics
- Enhanced mobile responsiveness

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## Dependencies

- React 19.0.0
- Retell Web Client SDK 2.0.5
- AudioMotion Analyzer 4.5.0
- Bootstrap 5.3.3
- Fuse.js 7.1.0

---

## Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

---

## Security Considerations

- Never expose API keys in client-side code.
- Use environment variables for sensitive data.
- Implement proper key rotation.
- Implement proper data encryption and privacy.
- Configure proper CORS headers and restrict allowed origins.

---

## Support

For support, please contact:
- Email: support@homelifeshield.com
- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)

---

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---


