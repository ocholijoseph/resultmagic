
'use client';

export default function ClassRanking({ classData, students }) {
  const getPositionBadge = (position) => {
    const colors = {
      1: 'bg-yellow-500',
      2: 'bg-gray-400',
      3: 'bg-orange-500'
    };
    return colors[position] || 'bg-blue-500';
  };

  const getGrade = (average) => {
    if (average >= 90) return 'A+';
    if (average >= 80) return 'A';
    if (average >= 70) return 'B';
    if (average >= 60) return 'C';
    if (average >= 50) return 'D';
    return 'F';
  };

  const calculateClassAverage = () => {
    if (!students.length || !classData.subjects || !classData.subjects.length) return 0;
    const totalSum = students.reduce((sum, s) => sum + (s.average || 0), 0);
    return (totalSum / students.length).toFixed(1);
  };

  const getHighestTotal = () => {
    if (!students.length) return 0;
    return Math.max(...students.map(s => s.overallTotal || 0));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mr-4">
          <i className="ri-trophy-line text-white text-xl"></i>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Class Rankings</h3>
          <p className="text-sm text-gray-600">{classData.className} - Overall Performance</p>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {students.map((student) => (
          <div key={student.id} className="flex items-center p-4 bg-gray-50 rounded-xl">
            <div className={`w-8 h-8 ${getPositionBadge(student.position)} rounded-full flex items-center justify-center mr-4`}>
              <span className="text-white font-bold text-sm">{student.position}</span>
            </div>
            
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800">{student.name}</h4>
              <p className="text-sm text-gray-600">#{student.admissionNumber}</p>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-sm text-gray-600">Total: {student.overallTotal || 0}</span>
                <span className="text-sm text-gray-600">Avg: {(student.average || 0).toFixed(1)}%</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  getGrade(student.average || 0) === 'A+' || getGrade(student.average || 0) === 'A' 
                    ? 'bg-green-100 text-green-800'
                    : getGrade(student.average || 0) === 'B' || getGrade(student.average || 0) === 'C'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {getGrade(student.average || 0)}
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <i className="ri-user-line text-gray-400"></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-xl">
        <h4 className="font-semibold text-blue-800 mb-2">Class Statistics</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {calculateClassAverage()}%
            </div>
            <div className="text-xs text-blue-700">Class Average</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {getHighestTotal()}
            </div>
            <div className="text-xs text-blue-700">Highest Total</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {students.length}
            </div>
            <div className="text-xs text-blue-700">Total Students</div>
          </div>
        </div>
      </div>
    </div>
  );
}
