# DLD — Frontend — Module 004: Tenant Management (Settings)
**Layer:** Frontend (Next.js) | **Mapped To:** backend/module_004 | mobile/module_004

## 1. Purpose
Showroom owner views and manages tenant-level settings: timezone, currency, tax config.

## 2. Routes
```
app/(admin)/settings/
  page.tsx                 Showroom settings overview
  tenant/page.tsx          Tenant info + settings
  billing/page.tsx         Subscription + billing info
```

## 3. Settings Form
```typescript
// Fields: timezone, currency, taxLabel, taxRate
const form = useForm({ resolver: zodResolver(tenantSettingsSchema) });
const mutation = useMutation({
  mutationFn: (data) => apiClient.patch('/api/v1/settings/tenant', data),
  onSuccess: () => {
    queryClient.invalidateQueries(['tenant-settings']);
    toast.success('Settings updated');
  },
});
```

## 4. Subscription Status Banner
If subscription status = TRIAL: show trial expiry countdown banner.
If PAST_DUE: show red banner with upgrade CTA.
If SUSPENDED: redirect to /suspended page.

## 5. Cross-Layer Mapping
- GET/PATCH /api/v1/settings/tenant -> backend module_004
- GET /api/v1/subscription          -> backend module_019
---
*Frontend DLD | Module 004 | Tenant Management*
