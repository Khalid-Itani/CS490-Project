import { Link } from 'react-router-dom'

export default function Jobs() {
  // demo list; replace with real data later
  const jobs = [
    { id: '123', title: 'Frontend Engineer' },
    { id: '456', title: 'Backend Engineer' },
  ]
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">Jobs</h1>
      <ul className="list-disc ml-6 sm:ml-8">
        {jobs.map(j => (
          <li key={j.id}>
            <Link className="text-blue-600 underline" to={`/jobs/${j.id}`}>
              {j.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
