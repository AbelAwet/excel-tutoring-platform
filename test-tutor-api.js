// Test the tutor API endpoint
const tutorId = '6945146788f1ede5c379550b'; // First tutor from our check

fetch(`http://localhost:5000/api/v1/tutors/${tutorId}`)
  .then(res => res.json())
  .then(data => {
    console.log('API Response:', JSON.stringify(data, null, 2));
    
    if (data.success && data.data.tutor) {
      const tutor = data.data.tutor;
      console.log('\n=== Tutor Data ===');
      console.log('Name:', tutor.user?.firstName, tutor.user?.lastName);
      console.log('Rating:', tutor.rating);
      console.log('\nSubjects:');
      tutor.subjects?.forEach((sub, i) => {
        console.log(`${i + 1}. ${sub.subject?.name || sub.name || 'NO NAME'} - ${sub.pricePerHour} ETB/hr`);
      });
    }
  })
  .catch(err => console.error('Error:', err));
