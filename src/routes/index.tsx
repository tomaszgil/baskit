import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '../components/dashboard'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return <Dashboard />
}
