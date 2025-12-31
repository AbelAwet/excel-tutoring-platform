// Test the GET /conversations API
const token = 'YOUR_TOKEN_HERE'; // Get this from browser localStorage

fetch('http://localhost:5000/api/v1/messages/conversations', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(res => res.json())
.then(data => {
  console.log('Response:', JSON.stringify(data, null, 2));
})
.catch(err => console.error('Error:', err));
