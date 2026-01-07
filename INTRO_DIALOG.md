# Intro Dialog - Implementation Guide

## Overview

A beautiful welcome dialog that appears when users first open the Codex, introducing them to the Scavenjer project and providing ways to get involved.

## Features

### Content
- **Welcome Message**: Introduces the codex as an ever-evolving lore system
- **Project Info**: Explains Scavenjer is a new experimental solo project
- **Call to Action**: Invites users to contribute or help
- **Contact Information**:
  - Discord link (redirects through main site)
  - Email address (highlighted but not clickable)

### User Experience
- Shows only on first visit to the Codex
- Two dismiss options:
  1. **"Remind Me Later"**: Closes dialog, will show again next time
  2. **"Got It, Don't Show Again"**: Closes and saves preference to localStorage
- Beautiful animations with Framer Motion
- Mobile responsive

## Visual Design

```
┌─────────────────────────────────────────────────────────┐
│                       [📖 Icon]                         │
│              Welcome to the Scavenjer Codex             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ℹ️  You're viewing an ever-evolving lore system for   │
│     Scavenjer. As the story unfolds, this codex will   │
│     grow and change...                                  │
│                                                         │
│  💜  Scavenjer is currently a new experimental solo     │
│     project without backing—a passion-driven...         │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Want to Help Shape This Universe?                 │ │
│  │                                                    │ │
│  │ If you'd like to contribute to the Scavenjer      │ │
│  │ story, help with development, or support the      │ │
│  │ project in other ways:                            │ │
│  │                                                    │ │
│  │ Discord:  Join via link on scavenjer.com          │ │
│  │ Email:    [Zaidek@scavenjer.com]                  │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│          [Remind Me Later]  [Got It, Don't Show Again] │
└─────────────────────────────────────────────────────────┘
```

## Technical Details

### State Management
```typescript
const [showIntro, setShowIntro] = useState(false);

useEffect(() => {
  const hasSeenIntro = localStorage.getItem('codex_intro_seen');
  if (!hasSeenIntro && isOpen) {
    setShowIntro(true);
  }
}, [isOpen]);
```

### LocalStorage Key
- **Key**: `codex_intro_seen`
- **Value**: `'true'` when user clicks "Don't Show Again"
- **Persistence**: Stored in browser, survives page refreshes

### Component Structure
```typescript
<IntroDialog 
  onClose={(dontShowAgain: boolean) => {
    if (dontShowAgain) {
      localStorage.setItem('codex_intro_seen', 'true');
    }
    setShowIntro(false);
  }}
/>
```

## Styling

### Colors
- **Background**: Dark gradient (rgba(31, 31, 31, 0.98) → rgba(17, 17, 17, 0.98))
- **Border**: Glowing indigo (rgba(99, 102, 241, 0.4))
- **Icons**: Indigo (#6366f1) and Purple (#8b5cf6)
- **Text**: White with varying opacity
- **Email Box**: Monospace font with dark background

### Animations
```css
/* Dialog Entry */
initial: { scale: 0.9, y: 20 }
animate: { scale: 1, y: 0 }

/* Overlay Fade */
initial: { opacity: 0 }
animate: { opacity: 1 }
```

### Responsive Design
- Desktop: Max-width 600px, centered
- Mobile: Full-width with padding, stacked buttons

## User Flow

```
1. User clicks Codex button (📖)
   ↓
2. Check localStorage for 'codex_intro_seen'
   ↓
   ├─ Not Found → Show Dialog
   │              ↓
   │              User clicks "Remind Me Later"
   │              → Close dialog (will show next time)
   │              ↓
   │              User clicks "Don't Show Again"
   │              → Save preference, close dialog
   │
   └─ Found → Skip dialog, show codex directly
```

## Contact Information Display

### Discord
- **Display**: "Join via link on scavenjer.com"
- **Link**: `href="/"` (goes to main site)
- **Style**: Clickable purple link with underline

### Email
- **Display**: `Zaidek@scavenjer.com`
- **Styling**: 
  - Monospace font (Courier New)
  - Dark background box
  - Indigo border
  - `user-select: all` (easy to copy)
- **Not Clickable**: No `mailto:` link (as requested)

## Accessibility

- **Semantic HTML**: Proper heading hierarchy
- **Focus Management**: Dialog traps focus when open
- **Keyboard Navigation**: Tab through buttons
- **Screen Readers**: Icons have text alternatives
- **Color Contrast**: High contrast text on dark background

## Testing Checklist

- [ ] Dialog appears on first codex open
- [ ] "Remind Me Later" closes but shows again next visit
- [ ] "Don't Show Again" saves preference and doesn't show again
- [ ] Discord link works correctly
- [ ] Email is copyable but not clickable
- [ ] Animations are smooth
- [ ] Mobile responsive layout works
- [ ] LocalStorage persistence works
- [ ] Dialog can be dismissed by clicking overlay (if implemented)
- [ ] All text is readable and properly styled

## Customization

### To Change Content
Edit the `IntroDialog` component in `CodexPanel.tsx`:
```typescript
<p>Your new text here...</p>
```

### To Change Contact Info
Update the contact section:
```typescript
<span className={styles.contactEmail}>
  newemail@scavenjer.com
</span>
```

### To Reset for Testing
Run in browser console:
```javascript
localStorage.removeItem('codex_intro_seen');
```

## Future Enhancements

Potential additions:
- [ ] "Take a Tour" button to guide through codex features
- [ ] Video introduction to Scavenjer
- [ ] Social media links
- [ ] Newsletter signup
- [ ] Show important updates/announcements
- [ ] Different messages for returning users

---

**Implementation Date**: January 2026  
**Status**: Active  
**LocalStorage Key**: `codex_intro_seen`




