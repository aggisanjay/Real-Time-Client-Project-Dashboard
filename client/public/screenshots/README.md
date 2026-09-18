# Dashboard Screenshots Directory

Place your project screenshot images in this directory to display them in the Landing Page and Login Page showcase frames!

### Recommended Image Names:
1. `admin-overview.png` - Full view of Admin Analytics & Client list
2. `pm-kanban.png` - Project Manager Team Kanban Board (drag-and-drop)
3. `dev-tasks.png` - Developer Workstation & Task List
4. `live-activity.png` - Real-time Activity Telemetry and Audit Log

### How to Activate Your Images:
Open `client/src/config/showcaseConfig.ts` and set the `imagePath` property for any tab:
```typescript
{
  id: 'overview',
  title: 'Admin Analytics & Client Portal',
  // ...
  imagePath: '/screenshots/admin-overview.png', // <-- add your image path here!
}
```

*Note: Whenever `imagePath` is empty (`""`), the application automatically renders the high-fidelity interactive live mockup.*
