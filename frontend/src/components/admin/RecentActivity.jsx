import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback } from '../ui/avatar'

export function RecentActivity({ activities = [] }) {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getStatusVariant = (status) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'success'
      case 'pending':
        return 'warning'
      case 'rejected':
      case 'cancelled':
        return 'destructive'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status) => {
    const labels = {
      completed: 'Complété',
      approved: 'Approuvé',
      pending: 'En attente',
      rejected: 'Rejeté',
      cancelled: 'Annulé',
    }
    return labels[status] || status
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activité Récente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              Aucune activité récente
            </p>
          ) : (
            activities.map((activity, index) => (
              <div key={index} className="flex items-start gap-4">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="text-xs">
                    {getInitials(activity.userName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none">
                      {activity.userName}
                    </p>
                    <Badge variant={getStatusVariant(activity.status)} className="text-xs">
                      {getStatusLabel(activity.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-400">
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
