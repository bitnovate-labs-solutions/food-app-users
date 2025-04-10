import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function NotificationSettings() {
  const {
    isSubscribed,
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications,
  } = usePushNotifications();

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribeFromPushNotifications();
    } else {
      await subscribeToPushNotifications();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Switch
            id="push-notifications"
            checked={isSubscribed}
            onCheckedChange={handleToggle}
          />
          <Label htmlFor="push-notifications">Push Notifications</Label>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Receive notifications for new messages even when the app is closed
        </p>
      </CardContent>
    </Card>
  );
}
