# Test Website for Chat Widget Navigation Warning

This is a simple 3-page website designed to test the chat widget navigation warning functionality.

## Pages

1. **Home** (`index.html`) - Main landing page with navigation links
2. **About** (`about.html`) - Information about the test
3. **Contact** (`contact.html`) - Contact form with external form submission

## How to Test

### 1. Start the Server
```bash
# From the main project directory
python3 -m http.server 8080
```

### 2. Access the Test Website
Open your browser and go to: `http://localhost:8080/testwebsite/`

### 3. Test the Navigation Warning

1. **Start a Call:**
   - Click on the chat widget to start a call
   - Wait for the call to become active

2. **Test Navigation:**
   - Try clicking any navigation link (Home, About, Contact)
   - Try clicking external links (Google, GitHub, etc.)
   - Try submitting the contact form

3. **Expected Behavior:**
   - A warning modal should appear asking if you want to open in a new tab
   - "Open in New Tab" should open the link in a new tab while keeping the call active
   - "Leave Page" should navigate away and end the call
   - "Cancel" should close the modal without navigation

## Features to Test

- ✅ **Internal Navigation** - Links between pages on the same site
- ✅ **External Navigation** - Links to external websites
- ✅ **Form Submission** - Contact form that submits to external URL
- ✅ **Modal Functionality** - All three modal buttons work correctly
- ✅ **Call State Management** - Warning only appears during active calls

## Notes

- This is a **non-SPA website** (traditional multi-page site)
- Navigation between pages will trigger the warning modal
- The widget automatically detects this is not an SPA and enables warnings
- On SPA sites, no warnings would appear as navigation doesn't end the call

## Troubleshooting

If the widget doesn't appear:
1. Make sure `../dist/chat-widget.js` exists
2. Check browser console for any JavaScript errors
3. Ensure the server is running on the correct port 