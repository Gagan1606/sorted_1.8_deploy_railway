const Index = () => {
  return (
    <div className="min-h-screen p-6 bg-[#f5f5f5]">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <button 
          className="mb-6 px-8 py-3 rounded-xl font-semibold text-white w-full max-w-xs mx-auto block transition-all hover:scale-[1.02]"
          style={{
            background: '#1a1a1a',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
          }}
        >
          View Groups
        </button>

        {/* View Options */}
        <div 
          className="mb-6 p-6 rounded-2xl bg-white border border-gray-200"
          style={{
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
          }}
        >
          <div className="flex flex-wrap gap-3 justify-center">
            <button 
              className="px-5 py-2.5 rounded-xl font-semibold text-white transition-all hover:scale-[1.02]"
              style={{
                background: '#2a2a2a'
              }}
            >
              Family
            </button>
            <button 
              className="px-5 py-2.5 rounded-xl font-semibold text-white transition-all hover:scale-[1.02]"
              style={{
                background: '#2a2a2a'
              }}
            >
              Friends
            </button>
            <button 
              className="px-5 py-2.5 rounded-xl font-semibold text-white transition-all hover:scale-[1.02]"
              style={{
                background: '#2a2a2a'
              }}
            >
              Vacation 2024
            </button>
          </div>
        </div>

        {/* Upload Section */}
        <div 
          className="mb-6 p-6 rounded-2xl bg-white border border-gray-200"
          style={{
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
          }}
        >
          <div className="flex flex-col md:flex-row gap-4">
            <input 
              type="file" 
              className="flex-1 p-3 rounded-xl border-2 border-gray-300 bg-white transition-all focus:border-gray-600"
              multiple
            />
            <input 
              type="text" 
              placeholder="Group Name"
              className="flex-1 md:flex-none md:w-48 p-3 rounded-xl border-2 border-gray-300 bg-white transition-all focus:border-gray-600"
            />
            <button 
              className="px-8 py-3 rounded-xl font-semibold text-white whitespace-nowrap transition-all hover:scale-[1.02]"
              style={{
                background: '#1a1a1a',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
              }}
            >
              Upload
            </button>
          </div>
        </div>

        {/* Create New Group Section */}
        <p className="text-gray-900 text-center font-semibold text-lg mb-4">
          New Group? Add your photos here
        </p>
        
        <div className="max-w-md mx-auto space-y-3 mb-6">
          <input 
            type="text" 
            placeholder="New Group Name"
            className="w-full p-3 rounded-xl border-2 border-gray-300 bg-white transition-all focus:border-gray-600"
          />
          <input 
            type="file" 
            className="w-full p-3 rounded-xl border-2 border-gray-300 bg-white transition-all focus:border-gray-600"
            multiple
          />
          <button 
            className="w-full px-8 py-3 rounded-xl font-semibold text-white transition-all hover:scale-[1.02]"
            style={{
              background: '#2a2a2a',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
            }}
          >
            Create Group
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center flex-wrap">
          <button 
            className="px-8 py-3 rounded-xl font-semibold text-white transition-all hover:scale-[1.02]"
            style={{
              background: '#666666',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)'
            }}
          >
            Home
          </button>
          <button 
            className="px-8 py-3 rounded-xl font-semibold text-white transition-all hover:scale-[1.02]"
            style={{
              background: '#4a4a4a',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)'
            }}
          >
            Exit
          </button>
        </div>

        {/* Photo Gallery Preview */}
        <div className="mt-12">
          <h3 className="text-gray-900 text-center font-bold text-3xl mb-8 relative pb-4" style={{
            fontFamily: 'Georgia, serif',
            letterSpacing: '1px'
          }}>
            December 1, 2025
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div 
                key={i}
                className="aspect-square rounded-xl overflow-hidden border border-gray-300 bg-gray-100"
                style={{
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div className="w-full h-full flex items-center justify-center text-gray-400 font-semibold">
                  Photo {i}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
