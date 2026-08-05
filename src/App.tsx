import { ACTIVE_IDEA, ideas } from './ideas'

export default function App() {
  const ActiveIdea = ideas[ACTIVE_IDEA]
  return <ActiveIdea />
}
