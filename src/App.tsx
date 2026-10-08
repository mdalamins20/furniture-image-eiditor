import ImageEditor from './components/ImageEditor';
import AppHeader from './components/Header/AppHeader';

function App() {
  return (
    <div className="h-screen overflow-hidden bg-[#F5F5F7] flex flex-col font-sans selection:bg-blue-200 selection:text-gray-900">
      {/* Native Desktop Pro App Header */}
      <AppHeader />

      {/* Main Content */}
      <main className="flex-1 w-full mx-auto px-2 sm:px-4 lg:px-8 xl:px-12 py-2 sm:py-4 flex flex-col overflow-hidden">
        <ImageEditor />
      </main>

    </div>
  );
}

export default App;
