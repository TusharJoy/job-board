import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

function JobDetails() {
  const { id } = useParams()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJobDetails()
  }, [id])

  const fetchJobDetails = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/jobs/${id}`)
      const data = await response.json()
      setJob(data)
    } catch (error) {
      console.error('Error fetching job details:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading job details...</div>
  }

  if (!job) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Job not found</h2>
        <Button asChild>
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{job.title}</h1>
          <p className="text-xl text-muted-foreground mt-2">{job.company}</p>
        </div>
        <Button asChild>
          <a href={job.url} target="_blank" rel="noopener noreferrer">
            Apply Now
          </a>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{job.location}</Badge>
            <Badge variant="outline">{job.jobType}</Badge>
            {job.salary && <Badge variant="outline">{job.salary}</Badge>}
          </div>

          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: job.description }} />
          </div>

          <div>
            <h3 className="font-semibold mb-2">Requirements</h3>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: job.requirements }} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button variant="outline" asChild>
          <Link to="/">Back to Jobs</Link>
        </Button>
      </div>
    </div>
  )
}

export default JobDetails 