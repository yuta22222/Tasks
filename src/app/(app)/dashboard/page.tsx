export const dynamic = 'force-dynamic'

import { TodaySummary } from '@/components/dashboard/TodaySummary'
import { UpcomingTasks } from '@/components/dashboard/UpcomingTasks'
import { TaskModal } from '@/components/tasks/TaskModal'

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <TodaySummary />
      <UpcomingTasks />
      <TaskModal />
    </div>
  )
}
