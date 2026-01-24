# Team Chat - Shortcuts & Commands

## Overview
The Team Chat now features intelligent autocomplete with **@ mentions** and **/ commands** to make communication faster and more efficient.

---

## 🎯 Features

### 1. **@ Mentions** - Tag Users & Files

#### Mention a User
Type `@` followed by a username to mention team members:
- `@Sarah` - Mentions Sarah Connor
- `@Bruce` - Mentions Bruce Wayne

**How it works:**
1. Type `@` in the message input
2. Start typing a name
3. Autocomplete dropdown appears with matching users
4. Use ↑↓ arrows to navigate
5. Press Enter or click to select

**Visual Feedback:**
- Mentions appear with a blue highlight: <span style="background: #DBEAFE; color: #1E40AF; padding: 2px 6px; border-radius: 4px;">@Sarah</span>

#### Reference a File
Type `@file:` to reference documents:
- `@file:T-800 Specs.pdf` - References the T-800 specs document
- `@file:Q4 Report.xlsx` - References the Q4 report

**Visual Feedback:**
- File references appear with a green highlight and file icon: <span style="background: #D1FAE5; color: #065F46; padding: 2px 6px; border-radius: 4px;">📄 T-800 Specs.pdf</span>

---

### 2. **/ Commands** - Quick Actions

Type `/` to access powerful commands:

| Command | Description | Usage |
|---------|-------------|-------|
| `/help` | Show all available commands | `/help` |
| `/invite [email]` | Invite a team member | `/invite john@example.com` |
| `/remind [time] [msg]` | Set a reminder | `/remind 2pm Review docs` |
| `/schedule [time]` | Schedule a meeting | `/schedule tomorrow 10am` |
| `/giphy [search]` | Search for a GIF | `/giphy happy dance` |

**How it works:**
1. Type `/` in the message input
2. Start typing a command name
3. Autocomplete shows matching commands with descriptions
4. Select a command and add parameters
5. Press Enter to execute

---

## 🎨 Autocomplete UI

### Dropdown Features
- **Smart filtering** - Shows relevant suggestions as you type
- **Icons** - Visual indicators for users (👤), files (📄), and commands (⚡)
- **Subtitles** - Additional context (email for users, path for files, description for commands)
- **Keyboard navigation** - Full keyboard support for power users
- **Highlighted selection** - Currently selected item is highlighted in blue

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `↑` | Navigate up in suggestions |
| `↓` | Navigate down in suggestions |
| `Enter` | Select current suggestion |
| `Esc` | Close autocomplete |

---

## 🖥️ User Interface

### Input Field
- **Placeholder hint**: `"Message #general • Type @ to mention, / for commands"`
- **Desktop hint**: Shows `"@ mention · / command"` on the right when empty
- **Focus ring**: Blue ring when active

### Help Panel
Click the **❓ Help** icon in the chat header to toggle a quick reference panel showing:
- All mention types
- Common commands
- Keyboard shortcuts
- Usage tips

---

## 💡 Examples

### Example 1: Mention a colleague about a document
```
Hey @Sarah, check out @file:T-800 Specs.pdf for the latest updates!
```
**Result:** Sarah gets notified, and the file is highlighted as a clickable reference.

### Example 2: Invite someone to the team
```
/invite jane@example.com
```
**Result:** System sends an invitation email and confirms with: `"Invitation sent to jane@example.com! 📧"`

### Example 3: Set a reminder
```
/remind Review Q4 financials before meeting
```
**Result:** System confirms: `"⏰ Reminder set! You'll be notified."`

### Example 4: Get help
```
/help
```
**Result:** System displays a formatted help message with all available commands and mentions.

---

## 🎯 Technical Details

### Autocomplete Trigger Detection
The system detects triggers in real-time by:
1. Monitoring cursor position in the input field
2. Parsing the word before the cursor
3. Checking if it starts with `@` or `/`
4. Filtering suggestions based on the query
5. Showing/hiding the dropdown accordingly

### Suggestion Types

#### User Suggestions
```typescript
{
  id: 'u1',
  type: 'user',
  label: 'Sarah Connor',
  subtitle: 'sarah@example.com',
  icon: <UserIcon />
}
```

#### File Suggestions
```typescript
{
  id: 'f1',
  type: 'file',
  label: 'T-800 Specs.pdf',
  subtitle: '/documents/t800-specs.pdf',
  icon: <File />
}
```

#### Command Suggestions
```typescript
{
  id: 'help',
  type: 'command',
  label: '/help',
  subtitle: 'Show available commands',
  icon: <HelpCircle />
}
```

### Command Execution
Commands are intercepted in the `handleSendMessage` function before creating a regular message:

```typescript
if (inputText.startsWith('/')) {
  const command = inputText.split(' ')[0].toLowerCase();
  
  switch (command) {
    case '/help':
      // Show help message
      break;
    case '/invite':
      // Send invitation
      break;
    // ... other commands
  }
}
```

---

## 🔒 Security Features

### Permissions
- **User mentions**: Available to all team members
- **File mentions**: Respects file permissions (future enhancement)
- **Commands**: Some commands restricted to admins (e.g., `/invite`)

### Validation
- Email validation for `/invite` command
- Rate limiting on command execution (future enhancement)
- Sanitized user input to prevent XSS

---

## 📱 Mobile Support

### Responsive Design
- Autocomplete dropdown adapts to mobile viewport
- Touch-friendly suggestion items (minimum 44px height)
- Simplified keyboard shortcuts on mobile
- Help panel is scrollable on small screens

### Mobile-Specific Features
- Tap anywhere to close autocomplete
- Larger touch targets for suggestions
- Optimized animation performance

---

## 🚀 Future Enhancements

### Planned Features
1. **Channel mentions** - `#general`, `#announcements`
2. **Rich formatting** - Bold, italic, code blocks
3. **Emoji picker** - Quick emoji insertion
4. **Slash command plugins** - Custom commands per organization
5. **AI assistance** - `/ai [question]` for quick answers
6. **File upload via drag & drop** - Auto-create file mentions
7. **Threaded replies** - Reply to specific messages
8. **Reaction emojis** - Quick reactions to messages
9. **Message editing** - Edit sent messages
10. **Search in chat** - Search messages, files, and mentions

### Integration Ideas
- **Calendar integration** - `/schedule` creates actual calendar events
- **Task creation** - `/task` creates a task in Projects
- **Deal updates** - `/deal [name] update [status]`
- **Contact quick add** - `/contact add [name] [email]`

---

## 📊 Analytics (Future)

Track usage to improve the feature:
- Most used commands
- Average autocomplete selections
- Time saved vs typing full names/commands
- User adoption rate

---

## 🎓 Tips for Power Users

1. **Speed typing**: Type `@` + first letter, hit Enter instantly
2. **Command aliases**: Remember `/h` for `/help` (future)
3. **Multiple mentions**: Tag multiple users in one message
4. **Command chaining**: Use `;` to chain commands (future)
5. **Keyboard-only workflow**: Never touch the mouse!

---

## 🐛 Troubleshooting

### Autocomplete not appearing?
- Make sure you typed `@` or `/` at the start of a word
- Check if there are matching results
- Try refreshing the page

### Mentions not highlighting?
- Verify the username is spelled correctly
- Check if the user exists in your team
- File references must start with `@file:`

### Commands not working?
- Ensure command starts with `/`
- Check command spelling
- Some commands require parameters (e.g., `/invite [email]`)
- System messages appear in yellow/amber bubbles

---

## 📝 Developer Notes

### Code Location
- **Component**: `pages/Chat.tsx`
- **Lines**: Autocomplete logic starts around line 60
- **Suggestions**: Lines 95-135 (detection and filtering)
- **Rendering**: Lines 300-350 (dropdown UI)

### Key Functions
- `detectTrigger()` - Detects @ or / in input
- `selectSuggestion()` - Inserts selected item
- `handleKeyDown()` - Keyboard navigation
- `renderMessageContent()` - Highlights mentions in messages

### State Management
- `showAutocomplete` - Controls dropdown visibility
- `autocompleteType` - 'mention' or 'command'
- `suggestions` - Filtered suggestion list
- `selectedSuggestionIndex` - Current keyboard selection

---

**Last Updated:** January 23, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
