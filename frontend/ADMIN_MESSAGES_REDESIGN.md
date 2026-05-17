# Admin Messages Redesign - Public Guestbook Style

## Overview
Redesign admin messages page to match the clean, card-based style of public guestbook.

## Current vs New Layout

### Current (3-Column):
```
┌──────┬─────────┬──────────┐
│ Side │  List   │  Detail  │
│ bar  │         │          │
└──────┴─────────┴──────────┘
```

### New (Single Column Cards):
```
┌─────────────────────────────┐
│ Header + Stats + Search     │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ Message Card 1          │ │
│ │ - Original message      │ │
│ │ - Replies thread        │ │
│ │ - Reply form            │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ Message Card 2          │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

## Key Components

### 1. Message Card
```tsx
<GlowCard hoverScale={1.01} className="group">
  <div className="p-6 space-y-4">
    {/* Header */}
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-lg font-semibold text-primary">
            {message.name.charAt(0).toUpperCase()}
          </span>
        </div>
        
        {/* Info */}
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">{message.name}</h4>
            {!message.read && (
              <Badge variant="default" className="h-5 text-xs">New</Badge>
            )}
            {message.replied && (
              <Badge variant="outline" className="h-5 text-xs">
                <Check className="h-3 w-3 mr-1" />
                Replied
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{message.email}</p>
          <p className="text-xs text-muted-foreground">{formatDate(message.createdAt)}</p>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <AnimatedIconButton
          variant="ghost"
          size="sm"
          onClick={() => handleToggleRead(message.id, message.read)}
        >
          {message.read ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </AnimatedIconButton>
        <AnimatedIconButton
          variant="ghost"
          size="sm"
          onClick={() => handleDelete(message.id)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </AnimatedIconButton>
      </div>
    </div>
    
    {/* Subject */}
    {message.subject && (
      <div className="bg-muted/50 rounded-lg px-3 py-2">
        <p className="text-sm font-medium">{message.subject}</p>
      </div>
    )}
    
    {/* Message */}
    <div>
      <p className="text-sm whitespace-pre-wrap">{message.message}</p>
    </div>
    
    {/* Replies Thread */}
    {message.replies && message.replies.length > 0 && (
      <div className="ml-12 space-y-3 border-l-2 border-primary/20 pl-4">
        {message.replies.map((reply) => (
          <div key={reply.id} className="group/reply">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                  reply.isAdmin ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  {reply.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{reply.name}</p>
                    {reply.isAdmin && (
                      <Badge variant="default" className="h-4 text-[10px] px-1">Admin</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatDate(reply.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{reply.message}</p>
                </div>
              </div>
              
              {/* Delete reply button */}
              <AnimatedIconButton
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteReply(message.id, reply.id)}
                className="opacity-0 group-hover/reply:opacity-100 transition-opacity"
              >
                <Trash2 className="h-3 w-3 text-destructive" />
              </AnimatedIconButton>
            </div>
          </div>
        ))}
      </div>
    )}
    
    {/* Reply Form */}
    <div className="space-y-3 pt-3 border-t">
      <Textarea
        placeholder="Write your reply..."
        value={replyTexts[message.id] || ''}
        onChange={(e) => setReplyTexts({...replyTexts, [message.id]: e.target.value})}
        rows={3}
        className="resize-none"
      />
      <div className="flex justify-end">
        <AnimatedButton
          size="sm"
          onClick={() => handleReply(message.id)}
          disabled={!replyTexts[message.id]?.trim()}
          hoverScale={1.05}
        >
          <Send className="h-3 w-3 mr-2" />
          Send Reply
        </AnimatedButton>
      </div>
    </div>
  </div>
</GlowCard>
```

### 2. Header with Stats
```tsx
<div className="flex items-center justify-between">
  <div>
    <h2 className="text-3xl font-bold">Messages</h2>
    <p className="text-muted-foreground">Manage guestbook messages</p>
  </div>
  <div className="flex items-center gap-2">
    <Badge variant="secondary">{messages.length} Total</Badge>
    <Badge variant="default">{unreadCount} Unread</Badge>
    <Badge variant="outline">{repliedCount} Replied</Badge>
  </div>
</div>
```

### 3. Search & Filter
```tsx
<GlowCard className="p-4">
  <div className="flex flex-col sm:flex-row gap-3">
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
      <Input placeholder="Search..." className="pl-9" />
    </div>
    <div className="flex gap-2">
      <AnimatedButton variant={filter === 'all' ? 'default' : 'outline'} size="sm">
        All
      </AnimatedButton>
      <AnimatedButton variant={filter === 'unread' ? 'default' : 'outline'} size="sm">
        Unread
      </AnimatedButton>
      <AnimatedButton variant={filter === 'replied' ? 'default' : 'outline'} size="sm">
        Replied
      </AnimatedButton>
    </div>
  </div>
</GlowCard>
```

## State Management

```tsx
const [messages, setMessages] = useState([]);
const [filter, setFilter] = useState('all');
const [search, setSearch] = useState('');
const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
const [loading, setLoading] = useState(true);
```

## Benefits

1. ✅ **Cleaner UI** - Single column, easier to scan
2. ✅ **Better UX** - All info in one card
3. ✅ **Inline replies** - See conversation in context
4. ✅ **Quick actions** - Reply without switching views
5. ✅ **Responsive** - Works better on mobile
6. ✅ **Consistent** - Matches public guestbook style

## Implementation

Due to file size (488 lines), recommend creating new file:
```bash
# Create new file
touch src/app/admin/messages-redesign/page.tsx

# Copy structure from custom-guestbook.tsx
# Adapt for admin features (delete, mark read, etc.)
```

## Testing

1. View all messages
2. Filter by unread/replied
3. Search messages
4. Reply to message
5. Delete reply
6. Delete message
7. Mark as read/unread
