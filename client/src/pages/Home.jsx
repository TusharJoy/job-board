import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Search, MapPin, Loader2, Globe } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

function Home() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [location, setLocation] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/jobs')
      const data = await response.json()
      setJobs(data)
    } catch (error) {
      console.error('Error fetching jobs:', error)
      toast({
        title: "Error",
        description: "Failed to fetch jobs. Please try refreshing the page.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    setIsSearching(true)
    try {
      const response = await fetch(`/api/jobs/search?keyword=${encodeURIComponent(searchTerm)}&location=${encodeURIComponent(location)}`)
      const data = await response.json()
      setJobs(data)
    } catch (error) {
      console.error('Error searching jobs:', error)
      toast({
        title: "Error",
        description: "Failed to search jobs. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col items-center space-y-4 text-center py-10 md:py-12">
          <Skeleton className="h-12 w-3/4 max-w-lg" />
          <Skeleton className="h-6 w-1/2 max-w-md mt-2" />
        </div>
        <Card className="max-w-3xl mx-auto p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Skeleton className="h-10 flex-1 w-full" />
            <Skeleton className="h-10 flex-1 w-full" />
            <Skeleton className="h-10 w-full sm:w-24" />
          </div>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="h-full border border-transparent">
              <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center text-sm text-muted-foreground mt-auto pt-4">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-9 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center space-y-4 text-center py-6 md:py-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">Find Your Dream Job</h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Explore thousands of job openings from leading companies worldwide.
        </p>
      </div>

      <Card className="max-w-3xl mx-auto p-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Job title or keywords"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative flex-1 w-full sm:w-auto">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" disabled={isSearching} className="w-full sm:w-24">
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Search"
            )}
          </Button>
        </form>
      </Card>

      {jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <Card 
              key={job.id} 
              className="h-full hover:bg-accent/50 transition-colors flex flex-col border border-transparent hover:border-primary/20"
            >
              <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                <Avatar className="hidden sm:flex h-12 w-12">
                  <AvatarImage src={job.companyLogoUrl} alt={`${job.company} logo`} />
                  <AvatarFallback>
                    {job.company?.substring(0, 2).toUpperCase() || '??'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1 flex-1">
                  <CardTitle>{job.title}</CardTitle>
                  <CardDescription>{job.company}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{job.location}</Badge>
                  <Badge variant="outline">{job.jobType}</Badge>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center text-sm text-muted-foreground mt-auto pt-4">
                <div className="flex items-center gap-2">
                  <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                  {job.source && (
                    <span className="flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5" />
                      {job.source}
                    </span>
                  )}
                </div>
                <Button size="sm" asChild>
                  <a href={job.url} target="_blank" rel="noopener noreferrer">
                    Apply Now
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-8">
          No jobs found matching your criteria.
        </div>
      )}
    </div>
  )
}

export default Home 