# DLD — Backend — Module 015: Notifications
**Layer:** Backend | **Mapped To:** frontend/module_015 | mobile/module_015

## 1. Purpose
Multi-channel notification system. In-app (v1) and Email (v1). SMS/Push/WhatsApp (v2).
Event-driven: notifications auto-triggered by business events.

## 2. Files
src/modules/notification/: notification.service.ts, notification.repository.ts, notification.dispatcher.ts, notification.types.ts
channels/: in-app.channel.ts, email.channel.ts
tests/

## 3. API Endpoints
| Method | Path                           | Role  | Description                |
|--------|--------------------------------|-------|----------------------------|
| GET    | /api/v1/notifications          | Auth  | List my notifications      |
| GET    | /api/v1/notifications/unread-count| Auth| Unread count badge        |
| PATCH  | /api/v1/notifications/:id/read | Auth  | Mark notification as read  |
| PATCH  | /api/v1/notifications/read-all | Auth  | Mark all as read           |
| DELETE | /api/v1/notifications/:id      | Auth  | Delete notification        |

## 4. Database Migration: notifications
```sql
CREATE TABLE "notifications" (
  "id"             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "tenant_id"      UUID NOT NULL REFERENCES "tenants"("id"),
  "user_id"        UUID NOT NULL REFERENCES "users"("id"),
  "type"           TEXT NOT NULL,
  "title"          TEXT NOT NULL,
  "body"           TEXT NOT NULL,
  "channel"        TEXT NOT NULL DEFAULT 'IN_APP',
  "status"         TEXT NOT NULL DEFAULT 'UNREAD',
  "reference_type" TEXT,
  "reference_id"   UUID,
  "created_at"     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX "idx_notifications_user_status" ON "notifications"("user_id","status");
CREATE INDEX "idx_notifications_tenant"      ON "notifications"("tenant_id");
```

## 5. Notification Dispatcher
```typescript
class NotificationDispatcher {
  async dispatch(event: NotificationEvent, payload: NotificationPayload): Promise<void> {
    const recipients = this.resolveRecipients(event, payload);
    for (const recipient of recipients) {
      const channels = this.resolveChannels(recipient.role, event);
      for (const channel of channels) {
        await channel.send(recipient, event, payload);
      }
    }
  }
}
```

## 6. Notification Event -> Recipients Mapping
| Event                      | Recipients              |
|----------------------------|-------------------------|
| SERVICE_REQUEST_RECEIVED   | Customer, Admin         |
| SERVICE_WORKER_ASSIGNED    | Customer, Worker        |
| SERVICE_IN_PROGRESS        | Customer                |
| SERVICE_COMPLETED          | Customer                |
| LOW_STOCK_ALERT            | Admin                   |
| SPARE_PART_ORDERED         | Customer, Admin         |
| SUBSCRIPTION_EXPIRING      | Tenant Owner            |

## 7. Business Rules
- Notifications scoped to tenantId + userId
- In-app channel: synchronous insert to DB
- Email channel: async (fire-and-forget with retry)
- Notifications paginated (limit 20)
- Unread count: separate lightweight query

## 8. Testing
- Service assigned -> notification created for customer and worker
- Unread count correct after marking read
- Notifications scoped to user (cross-user access denied)
---
*Backend DLD | Module 015 | Notifications*
