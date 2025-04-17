import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import JobDetails from '@/pages/JobDetails'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
        </Routes>
      </Layout>
      <Toaster />
    </Router>
  )
}

export default App 