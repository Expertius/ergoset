import { getNotifications } from "@/services/notifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Bell, AlertTriangle, AlertCircle, Info } from "lucide-react";

const severityConfig = {
  critical: {
    icon: AlertCircle,
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
    badge: "bg-red-100 text-red-800",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-orange-600",
    bg: "bg-orange-50 border-orange-200",
    badge: "bg-orange-100 text-orange-800",
  },
  info: {
    icon: Info,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    badge: "bg-blue-100 text-blue-800",
  },
};

export async function NotificationsPanel() {
  const notifications = await getNotifications();

  const criticalCount = notifications.filter((n) => n.severity === "critical").length;
  const warningCount = notifications.filter((n) => n.severity === "warning").length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Уведомления
          {criticalCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {criticalCount}
            </Badge>
          )}
          {warningCount > 0 && (
            <Badge className="bg-orange-100 text-orange-800 ml-1">
              {warningCount}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground">Всё в порядке</p>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {notifications.map((n) => {
              const config = severityConfig[n.severity];
              const Icon = config.icon;
              const href =
                n.entityType === "rental" || n.entityType === "payment"
                  ? `/deals/${n.entityId}`
                  : n.entityType === "asset"
                    ? `/assets/${n.entityId}`
                    : n.entityType === "accessory"
                      ? `/accessories/${n.entityId}`
                      : "#";

              return (
                <Link
                  key={n.id}
                  href={href}
                  className={`flex items-start gap-3 p-3 rounded-md border ${config.bg} hover:opacity-80 transition-opacity`}
                >
                  <Icon className={`h-4 w-4 mt-0.5 ${config.color} shrink-0`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {n.message}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
