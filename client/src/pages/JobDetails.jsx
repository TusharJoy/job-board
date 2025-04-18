import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"

function JobDetails() {
  const { id } = useParams()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

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
      toast({
        title: "Error",
        description: "Failed to fetch job details. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <Skeleton className="h-8 w-64 mb-3" />
            <Skeleton className="h-6 w-48" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-32" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-28" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-center">
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="flex justify-center items-center py-16">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Job Not Found</CardTitle>
            <CardDescription>The job you are looking for does not exist or may have been removed.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
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

          <Separator className="my-4" />

          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: job.description }} />
          </div>

          <Separator className="my-4" />

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