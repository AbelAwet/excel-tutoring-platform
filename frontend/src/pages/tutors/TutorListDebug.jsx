import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tutorService } from '../../services/tutorService';

const TutorListDebug = () => {
  const [debugInfo, setDebugInfo] = useState('');

  // Fetch tutors with error handling
  const { data: tutorsData, isLoading, error } = useQuery({
    queryKey: ['tutors-debug'],
    queryFn: async () => {
      try {
        console.log('🔍 Fetching tutors...');
        const result = await tutorService.getAllTutors({});
        console.log('✅ Tutors fetched:', result);
        setDebugInfo(`Success: ${JSON.stringify(result.data, null, 2)}`);
        return result;
      } catch (err) {
        console.error('❌ Error fetching tutors:', err);
        setDebugInfo(`Error: ${err.message}\nResponse: ${JSON.stringify(err.response?.data, null, 2)}`);
        throw err;
      }
    },
    retry: false
  });

  const tutors = tutorsData?.data?.tutors || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Tutor List Debug</h1>
      
      <div className="space-y-6">
        {/* Debug Info */}
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Debug Information</h2>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
            <p><strong>Error:</strong> {error ? error.message : 'None'}</p>
            <p><strong>Tutors Count:</strong> {tutors.length}</p>
            <p><strong>Raw Data:</strong></p>
            <pre className="bg-gray-200 dark:bg-gray-700 p-2 rounded text-sm overflow-auto max-h-40">
              {debugInfo || 'No data yet...'}
            </pre>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading tutors...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 p-4 rounded-lg">
            <h3 className="text-red-800 dark:text-red-200 font-semibold">Error Loading Tutors</h3>
            <p className="text-red-600 dark:text-red-300">{error.message}</p>
            {error.response && (
              <pre className="mt-2 text-sm bg-red-50 dark:bg-red-900/10 p-2 rounded">
                {JSON.stringify(error.response.data, null, 2)}
              </pre>
            )}
          </div>
        )}

        {/* Success State */}
        {!isLoading && !error && (
          <div className="bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 p-4 rounded-lg">
            <h3 className="text-green-800 dark:text-green-200 font-semibold">
              Successfully loaded {tutors.length} tutor(s)
            </h3>
            
            {tutors.length === 0 ? (
              <p className="text-green-600 dark:text-green-300 mt-2">
                No tutors found in the database. Make sure you have verified tutors with isAvailable: true.
              </p>
            ) : (
              <div className="mt-4 space-y-2">
                {tutors.map((tutor, index) => (
                  <div key={tutor._id} className="bg-white dark:bg-gray-700 p-3 rounded border">
                    <h4 className="font-semibold">
                      {index + 1}. {tutor.user?.firstName} {tutor.user?.lastName}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Email: {tutor.user?.email}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Verification: {tutor.verificationStatus} | Available: {tutor.isAvailable ? 'Yes' : 'No'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Subjects: {tutor.subjects?.length || 0}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* API Test Buttons */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Manual Tests</h3>
          <div className="space-x-2">
            <button
              onClick={async () => {
                try {
                  const response = await fetch('/api/v1/tutors');
                  const data = await response.json();
                  setDebugInfo(`Direct fetch: ${JSON.stringify(data, null, 2)}`);
                } catch (err) {
                  setDebugInfo(`Direct fetch error: ${err.message}`);
                }
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Test Direct API Call
            </button>
            
            <button
              onClick={() => {
                console.log('Current axios config:', tutorService);
                setDebugInfo(`Axios config logged to console`);
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Log Axios Config
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorListDebug;