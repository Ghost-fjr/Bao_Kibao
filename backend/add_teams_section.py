import sys

# Read the file
with open(r'c:\Users\Gh_o_st\Desktop\Bao_Kibao\Bao_Kibao 101\frontend\src\pages\public\TournamentDetailsPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Define the teams section to insert
teams_section = '''
                    {/* Registered Teams Section */}
                    {teams.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Registered Teams</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {teams.map((team) => (
                                    <div key={team.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3 flex-1">
                                                {team.logo && (
                                                    <img
                                                        src={team.logo}
                                                        alt={team.name}
                                                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-gray-900">{team.name}</h3>
                                                    <p className="text-sm text-gray-500">
                                                        {team.player_count || 0} players
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                team.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                team.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {team.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
'''

# Find the position to insert (before "Pools and Standings Section")
marker = '                    {/* Pools and Standings Section */'
if marker in content:
    content = content.replace(marker, teams_section + '\n' + marker)
    
    # Write back
    with open(r'c:\Users\Gh_o_st\Desktop\Bao_Kibao\Bao_Kibao 101\frontend\src\pages\public\TournamentDetailsPage.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Teams section added successfully!")
else:
    print("Marker not found!")
    sys.exit(1)
