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
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="h-10 w-1/2" />
          <div className="flex gap-4 w-full max-w-2xl">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="h-full">
              <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-1">
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
              <CardFooter className="flex justify-between items-center text-sm text-muted-foreground">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-2/5" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center space-y-4">
        <h1 className="text-4xl font-bold">Find Your Dream Job</h1>
        <form onSubmit={handleSearch} className="flex gap-4 w-full max-w-2xl items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Job title or keywords"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" disabled={isSearching} className="w-24">
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Search"
            )}
          </Button>
        </form>
      </div>

      {jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <Link to={`/jobs/${job.id}`} key={job.id}>
              <Card className="h-full hover:bg-accent/50 transition-colors">
                <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                  <Avatar className="hidden sm:flex h-12 w-12">
                    <AvatarImage src={job.companyLogoUrl} alt={`${job.company} logo`} />
                    <AvatarFallback>
                      {job.company?.substring(0, 2).toUpperCase() || '??'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
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
                <CardFooter className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                  {job.source && (
                    <span className="flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5" />
                      {job.source}
                    </span>
                  )}
                </CardFooter>
              </Card>
            </Link>
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