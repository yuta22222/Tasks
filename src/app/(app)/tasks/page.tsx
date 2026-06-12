export const dynamic = 'force-dynamic'

import { TaskList } from '@/components/tasks/TaskList'
import { TaskModal } from '@/components/tasks/TaskModal'

export default function TasksPage() {
  return (
    <>
      <TaskList />
      <TaskModal />
    </>
  )
}
