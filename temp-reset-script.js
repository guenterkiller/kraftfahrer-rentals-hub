// Quick test script to reset Günter Killer's status
async function resetDriverStatus() {
  const response = await fetch('https://hxnabnsoffzevqhruvar.supabase.co/functions/v1/reset-driver-status', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4bmFibnNvZmZ6ZXZxaHJ1dmFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MTI1OTMsImV4cCI6MjA2ODQ4ODU5M30.WI-nu1xYjcjz67ijVTyTGC6GPW77TOsFdy1cpPW4dzc'
    },
    body: JSON.stringify({
      driverId: 'c82fede1-8ac5-4301-ac4e-c7f93aa2ce18',
      newStatus: 'pending'
    })
  });
  
  const result = await response.json();
  console.log('Reset result:', result);
}

resetDriverStatus();