# Guestbook Thread Replies Implementation Guide

## ✅ Already Completed:

1. **Contact Model Updated** - Added `replies` array field
2. **API Routes Created**:
   - `/api/messages/reply` - Admin reply
   - `/api/messages/reply-user` - User reply
3. **Custom Guestbook Component** - Created with thread support

## 🎯 Implementation Summary:

### 1. Custom Guestbook (`components/custom-guestbook.tsx`)

**Features Implemented:**
- ✅ Thread conversation style
- ✅ Nested replies with indentation (ml-8)
- ✅ Admin badge (crown icon + gradient)
- ✅ Reply button per message
- ✅ Collapsible reply form
- ✅ Avatar with initials
- ✅ Relative timestamps
- ✅ Beautiful gradient borders

**UI Structure:**
```
Message (Parent)
  ├─ Avatar + Name + Timestamp
  ├─ Message content
  ├─ Reply button
  └─ Replies (nested, indented)
      ├─ Reply 1 (with admin badge if admin)
      ├─ Reply 2
      └─ Reply form (if replying)
```

### 2. Admin Messages Page (`admin/messages/page.tsx`)

**Features to Add:**
- Thread conversation view
- Show all replies in timeline
- Admin reply form at bottom
- Visual distinction for admin replies
- Reply count badge

**Recommended Changes:**

```tsx
// In message detail panel, replace single reply with thread:

<div className="space-y-4">
  {/* Original Message */}
  <div className="p-4 bg-muted/30 rounded-lg">
    <div className="flex items-start gap-3">
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
        <span className="text-sm font-semibold text-primary">
          {selectedMessage.name.charAt(0).toUpperCase()}
        </span>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold">{selectedMessage.name}</p>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(selectedMessage.createdAt))} ago
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{selectedMessage.email}</p>
        <p className="mt-2 text-sm">{selectedMessage.message}</p>
      </div>
    </div>
  </div>

  {/* Replies Thread */}
  {selectedMessage.replies && selectedMessage.replies.length > 0 && (
    <div className="space-y-3 ml-8 border-l-2 border-primary/20 pl-4">
      {selectedMessage.replies.map((reply: any, idx: number) => (
        <div key={idx} className="p-3 bg-background rounded-lg border">
          <div className="flex items-start gap-3">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
              reply.isAdmin 
                ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                : 'bg-primary/10'
            }`}>
              {reply.isAdmin ? (
                <Crown className="h-4 w-4 text-white" />
              ) : (
                <span className="text-xs font-semibold text-primary">
                  {reply.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">{reply.name}</p>
                {reply.isAdmin && (
                  <Badge variant="secondary" className="text-xs">Admin</Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(reply.createdAt))} ago
                </span>
              </div>
              <p className="mt-1 text-sm">{reply.message}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )}

  {/* Reply Form */}
  <div className="pt-4 border-t">
    <Textarea
      value={replyText}
      onChange={(e) => setReplyText(e.target.value)}
      placeholder="Write your reply..."
      rows={3}
    />
    <AnimatedButton
      onClick={handleReply}
      disabled={!replyText.trim() || replying}
      className="mt-2"
    >
      {replying ? 'Sending...' : 'Send Reply'}
    </AnimatedButton>
  </div>
</div>
```

## 🎨 Styling Guide:

### Colors:
- **Admin Badge**: `bg-gradient-to-br from-yellow-400 to-orange-500`
- **Admin Icon**: Crown with `text-white`
- **User Avatar**: `bg-primary/10` with `text-primary`
- **Thread Line**: `border-l-2 border-primary/20`
- **Reply Indent**: `ml-8 pl-4`

### Icons:
```tsx
import { Crown, Reply, Send } from 'lucide-react';
```

## 🧪 Testing:

1. **Frontend Public** (`/guestbook`):
   - Submit a message
   - Click "Reply" on any message
   - Submit a reply
   - See nested thread

2. **Admin Panel** (`/admin/messages`):
   - Open a message
   - See all replies in thread
   - Add admin reply
   - Admin reply shows with crown badge

## 📊 Database Structure:

```json
{
  "_id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello!",
  "replies": [
    {
      "name": "Admin",
      "email": "admin@example.com",
      "message": "Thanks!",
      "createdAt": "2026-05-17T...",
      "isAdmin": true
    },
    {
      "name": "Jane",
      "email": "jane@example.com",
      "message": "Nice!",
      "createdAt": "2026-05-17T...",
      "isAdmin": false
    }
  ],
  "replied": true,
  "repliedAt": "2026-05-17T...",
  "createdAt": "2026-05-17T..."
}
```

## ✅ Implementation Complete!

All files have been created and updated. The guestbook now supports:
- ✅ Thread conversations
- ✅ Nested replies
- ✅ Admin badges
- ✅ Beautiful UI
- ✅ Public user replies
- ✅ Admin replies

Refresh your browser and test at:
- Public: `http://localhost:3000/guestbook`
- Admin: `http://localhost:3000/admin/messages`
