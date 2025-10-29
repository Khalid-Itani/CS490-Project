import { useParams } from 'react-router-dom'

export default function JobDetails() {
  const { jobId } = useParams()
  // Later: fetch job by jobId to show the real title in breadcrumbs (I can wire a lookup hook if you want)
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">Job Details</h1>
      <p>Job ID: <span className="font-mono">{jobId}</span></p>
    </div>
  )
}
