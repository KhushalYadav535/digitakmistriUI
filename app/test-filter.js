// Test filter logic for worker jobs
const STATUS_OPTIONS = [
  { key: 'all', label: 'All' },
  { key: 'Pending', label: 'Pending' },
  { key: 'Worker Assigned', label: 'Assigned' },
  { key: 'Accepted', label: 'Accepted' },
  { key: 'In Progress', label: 'In Progress' },
  { key: 'Completed', label: 'Completed' },
  { key: 'Cancelled', label: 'Cancelled' },
];

// Sample job data (what we expect from backend)
const sampleJobs = [
  { _id: '1', status: 'Pending' },
  { _id: '2', status: 'Worker Assigned' },
  { _id: '3', status: 'Accepted' },
  { _id: '4', status: 'In Progress' },
  { _id: '5', status: 'Completed' },
];

// Test filter function
function testFilter(jobs, selectedStatus) {
  console.log('Testing filter for status:', selectedStatus);
  console.log('Available jobs:', jobs.map(j => ({ id: j._id, status: j.status })));
  
  if (selectedStatus === 'all') {
    return jobs;
  }
  
  const filtered = jobs.filter(job => {
    const jobStatus = job.status || '';
    console.log(`Comparing job status "${jobStatus}" with selected "${selectedStatus}"`);
    
    // Handle status mapping for better filtering
    switch (selectedStatus) {
      case 'Pending':
        return jobStatus === 'Pending';
      case 'Worker Assigned':
        return jobStatus === 'Worker Assigned';
      case 'Accepted':
        return jobStatus === 'Accepted';
      case 'In Progress':
        return jobStatus === 'In Progress';
      case 'Completed':
        return jobStatus === 'Completed';
      case 'Cancelled':
        return jobStatus === 'Cancelled';
      default:
        return jobStatus === selectedStatus;
    }
  });
  
  console.log('Filtered jobs:', filtered.map(j => ({ id: j._id, status: j.status })));
  return filtered;
}

// Test all filter options
console.log('=== FILTER TEST RESULTS ===');
STATUS_OPTIONS.forEach(option => {
  console.log(`\n--- Testing ${option.label} filter ---`);
  const result = testFilter(sampleJobs, option.key);
  console.log(`Result: ${result.length} jobs found`);
});

console.log('\n=== EXPECTED BEHAVIOR ===');
console.log('All: Should show all 5 jobs');
console.log('Pending: Should show 1 job (id: 1)');
console.log('Worker Assigned: Should show 1 job (id: 2)');
console.log('Accepted: Should show 1 job (id: 3)');
console.log('In Progress: Should show 1 job (id: 4)');
console.log('Completed: Should show 1 job (id: 5)');
console.log('Cancelled: Should show 0 jobs'); 