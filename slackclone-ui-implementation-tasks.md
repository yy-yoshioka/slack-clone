# SlackClone UI Implementation Checklist

## Sidebar Enhancement

### Task 1: Update `components/layout/sidebar.tsx`
- [ ] Change background color to #3F0E40
- [ ] Adjust padding to 16px for container, 8px between items
- [ ] Update hover states to use lighten background color
- [ ] Standardize icon sizes to 18px
- [ ] Add proper left padding for nested items

### Task 2: Improve Collapsible Sections
- [ ] Add proper chevron icons to section headers
- [ ] Implement smooth rotation animation for expand/collapse
- [ ] Add localStorage persistence for section expanded state
- [ ] Style section headers with uppercase and lighter color text
- [ ] Add proper spacing between sections (16px)

### Task 3: Enhance `components/channels/channel-list.tsx`
- [ ] Update channel items to include proper # icon
- [ ] Add hover effect matching Slack's design
- [ ] Fix spacing between channel items
- [ ] Style active channel with proper background highlight
- [ ] Improve "Add channels" button styling

## Channel View Improvements

### Task 4: Fix `components/layout/header.tsx`
- [ ] Add fixed positioning with proper bottom border
- [ ] Update channel name display with # prefix
- [ ] Add vertical dots menu for channel actions
- [ ] Include member count with people icon
- [ ] Ensure consistent vertical alignment of elements

### Task 5: Update `components/channels/channel-tabs.tsx`
- [ ] Style tabs to match Slack's design (border-bottom for active)
- [ ] Fix spacing between tabs (24px)
- [ ] Add proper hover effect for inactive tabs
- [ ] Add Details button to right side of header with info icon
- [ ] Ensure proper vertical alignment with channel name

### Task 6: Create Channel Welcome in `app/(main)/[workspaceId]/[channelId]/page.tsx`
- [ ] Add welcome header with wave emoji (👋)
- [ ] Include channel description text
- [ ] Create 3-4 action cards for common tasks
- [ ] Style cards with proper icons and hover states
- [ ] Add join/details buttons at bottom with proper styling

## Message Input Enhancement

### Task 7: Update `components/messages/message-input.tsx`
- [ ] Change input shape to pill design with proper padding
- [ ] Add formatting toolbar with consistent icon styling
- [ ] Implement auto-expanding behavior for text input
- [ ] Update attachment button styling with upload icon
- [ ] Style send button with paper airplane icon

### Task 8: Add Formatting Options
- [ ] Add bold, italic, strikethrough buttons
- [ ] Implement code and link formatting buttons
- [ ] Add bulleted and numbered list options
- [ ] Include emoji picker button with proper styling
- [ ] Add code block formatting option

## General UI Elements

### Task 9: Fix `app/(main)/layout.tsx`
- [ ] Update overall spacing and layout
- [ ] Fix header to top of viewport
- [ ] Ensure proper content scrolling behavior
- [ ] Add separator between sidebar and main content
- [ ] Fix z-index issues for overlapping elements

### Task 10: Improve `components/messages/message-list.tsx`
- [ ] Update message spacing (16px between groups)
- [ ] Add date separators with proper styling
- [ ] Implement "New messages" indicator when applicable
- [ ] Ensure consistent avatar display size and position
- [ ] Fix message alignment and padding

### Task 11: Create Notification Banner
- [ ] Create new banner component for notifications
- [ ] Position at bottom of screen with proper z-index
- [ ] Add bell icon and explanatory text
- [ ] Include dismiss (X) button
- [ ] Add "Enable notifications" action button

### Task 12: Update Empty States
- [ ] Create empty state for new channels
- [ ] Add conversation starter buttons/suggestions
- [ ] Style with proper vertical spacing and alignment
- [ ] Include explanatory text matching Slack's tone
- [ ] Add light illustrations if appropriate

## Message Formatting Improvements

### Task 13: Enhance `components/messages/message-item.tsx`
- [ ] Support rendering of formatted text (bold, italic, etc.)
- [ ] Add proper styling for code blocks with syntax highlighting
- [ ] Implement proper quote styling with left border
- [ ] Add support for bulleted and numbered lists
- [ ] Ensure proper spacing for multi-paragraph messages

### Task 14: Fix Message Interactions
- [ ] Add hover actions menu to messages (react, reply, etc.)
- [ ] Implement proper hover state styling
- [ ] Add thread indicator for messages with replies
- [ ] Improve emoji reaction display to match Slack's pill style
- [ ] Add proper timestamp formatting and hover states
