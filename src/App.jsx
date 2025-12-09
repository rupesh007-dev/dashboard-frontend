import { useEffect, useState } from 'react';

function App() {
  const [version, setVersion] = useState('');
  const [updateStatus, setUpdateStatus] = useState('Idle'); // Idle, Available, Downloading, Ready
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Get current version
    if (window.electronAPI) {
      window.electronAPI.getAppVersion().then((ver) => setVersion(ver));

      // Listeners
      window.electronAPI.onUpdateAvailable(() => {
        setUpdateStatus('Available');
      });

      window.electronAPI.onDownloadProgress((progObj) => {
        setUpdateStatus('Downloading');
        setProgress(progObj.percent);
      });

      window.electronAPI.onUpdateDownloaded(() => {
        setUpdateStatus('Ready');
      });
    }
  }, []);

  const handleRestart = () => {
    window.electronAPI.quitAndInstall();
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 space-y-4">
      <h1 className="text-3xl font-bold underline">Dashboard v{version}</h1>
      
      {/* Update Status UI */}
      <div className="p-4 bg-white rounded shadow-md w-96 text-center">
        <p className="font-semibold mb-2">Update Status: {updateStatus}</p>

        {updateStatus === 'Downloading' && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
            <p className="text-sm mt-1">{Math.round(progress)}%</p>
          </div>
        )}

        {updateStatus === 'Ready' && (
          <button
            onClick={handleRestart}
            className="mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Restart & Update
          </button>
        )}
      </div>
    </div>
  );
}

export default App;