import { useState, useMemo } from 'react';
import './App.css';
import resultsData from './data/results.json';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend,
  AreaChart, Area
} from 'recharts';
import {
  LayoutDashboard, Users, UserCircle, BarChart3,
  TrendingUp, AlertTriangle, Zap, Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Result = typeof resultsData[0];

function App() {
  const [role, setRole] = useState<'faculty' | 'hod' | 'student'>('faculty');
  const [selectedStudent, setSelectedStudent] = useState<Result>(resultsData[0]);

  return (
    <div className="aura-app">
      <aside className="aura-sidebar glass">
        <div className="aura-brand">
          <div className="aura-logo-icon">
            <Zap size={24} fill="white" />
          </div>
          <h2>AURA ANALYTICS</h2>
        </div>

        <nav className="aura-nav">
          <p className="aura-stat-label" style={{ marginBottom: '8px' }}>Ecosystem</p>
          <button
            className={`aura-nav-btn ${role === 'faculty' ? 'active' : ''}`}
            onClick={() => setRole('faculty')}
          >
            <Users size={20} /> Faculty Portal
          </button>
          <button
            className={`aura-nav-btn ${role === 'hod' ? 'active' : ''}`}
            onClick={() => setRole('hod')}
          >
            <BarChart3 size={20} /> HOD Insights
          </button>
          <button
            className={`aura-nav-btn ${role === 'student' ? 'active' : ''}`}
            onClick={() => setRole('student')}
          >
            <UserCircle size={20} /> Student Hub
          </button>
        </nav>

        <div className="aura-status" style={{ marginTop: 'auto', padding: '16px' }}>
          <div className="aura-brand" style={{ gap: '8px' }}>
            <Zap size={16} color="var(--aura-accent)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>System Active</span>
          </div>
        </div>
      </aside>

      <main className="aura-main">
        <header className="aura-header">
          <div>
            <h1>{role === 'faculty' ? 'Faculty Analytics' : role === 'hod' ? 'Structural Overview' : 'Personal Mastery'}</h1>
            <p>{role === 'student' ? `Refining performance for ${selectedStudent.name}` : 'Real-time academic performance engine'}</p>
          </div>
          <div className="aura-list-info">
            <div className="aura-list-avatar">{role.charAt(0).toUpperCase()}</div>
            <div>
              <p className="aura-list-name">{role === 'student' ? selectedStudent.id : 'Admin Portal'}</p>
              <p className="aura-list-sub">Authenticated</p>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={role}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "circOut" }}
          >
            {role === 'faculty' && <FacultyPortal data={resultsData} />}
            {role === 'hod' && <HODPortal data={resultsData} />}
            {role === 'student' && <StudentHub student={selectedStudent} setSelected={setSelectedStudent} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

// Sub-Dashboards
const FacultyPortal = ({ data }: { data: typeof resultsData }) => {
  const avgPerformance = (data.reduce((acc, s) => acc + (s.subjects.reduce((a, b) => a + b.total, 0) / s.subjects.length), 0) / data.length).toFixed(1);
  const subjectStats = data[0].subjects.map(sub => {
    const avg = data.reduce((acc, s) => acc + (s.subjects.find(sb => sb.name === sub.name)?.total || 0), 0) / data.length;
    return { name: sub.name, avg: parseFloat(avg.toFixed(1)) };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div className="aura-grid">
        <StatCard label="Live Class Avg" val={`${avgPerformance}%`} icon={<TrendingUp size={20} />} />
        <StatCard label="Engagement" val="88%" icon={<LayoutDashboard size={20} />} />
        <StatCard label="Interventions" val={data.filter(s => s.attendance < 75).length} icon={<AlertTriangle size={20} />} risk />
        <StatCard label="Success Path" val="Excellent" icon={<Target size={20} />} safe />
      </div>

      <div className="aura-chart-section">
        <div className="aura-chart-card glass">
          <div className="aura-chart-header">
            <h3>Subject Competency Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={subjectStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--aura-sub)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--aura-sub)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--aura-surface)', border: '1px solid var(--aura-border)', borderRadius: '12px' }}
                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
              />
              <Bar dataKey="avg" fill="var(--aura-accent)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="aura-chart-card glass">
          <div className="aura-chart-header">
            <h3>Urgent Interventions</h3>
          </div>
          <div className="aura-list">
            {data.filter(s => s.attendance < 80).map(s => (
              <div key={s.id} className="aura-list-item">
                <div className="aura-list-info">
                  <div className="aura-list-avatar">{s.name.charAt(0)}</div>
                  <div>
                    <p className="aura-list-name">{s.name}</p>
                    <p className="aura-list-sub">{s.attendance}% Attendance</p>
                  </div>
                </div>
                <div className="aura-badge aura-badge-risk">Warning</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const HODPortal = ({ data }: { data: typeof resultsData }) => {
  const sectionData = useMemo(() => {
    const subjects = data[0].subjects.map(s => s.name);
    return subjects.map(sub => {
      const getAvg = (sec: string) => {
        const d = data.filter(s => s.section === sec);
        return d.reduce((acc, curr) => acc + (curr.subjects.find(s => s.name === sub)?.total || 0), 0) / d.length;
      };
      return { subject: sub, A: getAvg('A'), B: getAvg('B') };
    });
  }, [data]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div className="aura-grid">
        <StatCard label="Active Sections" val="2" icon={<Users size={20} />} />
        <StatCard label="Leading Core" val="Section B" icon={<Target size={20} />} safe />
        <StatCard label="Audit Status" val="Optimal" icon={<Zap size={20} />} />
        <StatCard label="TOC Proficiency" val="64%" icon={<Target size={20} />} risk />
      </div>

      <div className="aura-chart-card glass">
        <div className="aura-chart-header">
          <h3>Structural Competency Gap (Section A vs B)</h3>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={sectionData}>
            <defs>
              <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--aura-accent)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--aura-accent)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="subject" stroke="var(--aura-sub)" fontSize={11} axisLine={false} tickLine={false} />
            <YAxis stroke="var(--aura-sub)" fontSize={11} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: 'var(--aura-surface)', border: '1px solid var(--aura-border)', borderRadius: '12px' }} />
            <Area type="monotone" dataKey="A" stroke="var(--aura-accent)" fillOpacity={1} fill="url(#colorA)" strokeWidth={3} />
            <Area type="monotone" dataKey="B" stroke="#10b981" fillOpacity={1} fill="url(#colorB)" strokeWidth={3} />
            <Legend verticalAlign="top" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const StudentHub = ({ student, setSelected }: { student: Result, setSelected: (s: Result) => void }) => {
  const radarData = student.subjects.map(s => ({ subject: s.name, fullMark: 100, score: s.total }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div className="student-card-grid">
        {resultsData.map(s => (
          <div
            key={s.id}
            className={`student-card glass ${student.id === s.id ? 'active' : ''}`}
            onClick={() => setSelected(s)}
          >
            <div className="aura-list-avatar" style={{ margin: '0 auto 8px' }}>{s.name.charAt(0)}</div>
            <p className="aura-list-name">{s.name}</p>
            <p className="aura-list-sub">{s.id}</p>
          </div>
        ))}
      </div>

      <div className="aura-chart-section">
        <div className="aura-chart-card glass">
          <div className="aura-chart-header">
            <h3>Mastery Profile: {student.archetype}</h3>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.05)" />
              <PolarAngleAxis dataKey="subject" stroke="var(--aura-sub)" fontSize={11} />
              <Radar name="Proficiency" dataKey="score" stroke="var(--aura-accent)" fill="var(--aura-accent)" fillOpacity={0.5} strokeWidth={3} />
              <Tooltip contentStyle={{ background: 'var(--aura-surface)', border: '1px solid var(--aura-border)', borderRadius: '12px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="aura-chart-card glass">
          <div className="aura-chart-header">
            <h3>Module Breakdown</h3>
          </div>
          <div className="aura-list">
            {student.subjects.map(s => (
              <div key={s.name} className="aura-list-item">
                <div>
                  <p className="aura-list-name">{s.name}</p>
                  <p className="aura-list-sub">{s.difficulty}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p className="aura-list-name">{s.total}%</p>
                  <div className={`aura-badge ${s.total > 70 ? 'aura-badge-safe' : 'aura-badge-risk'}`}>
                    {s.total > 70 ? 'Passed' : 'Critical'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, val, icon, risk, safe }: any) => (
  <div className="aura-stat glass">
    <div className="aura-stat-icon" style={{
      color: risk ? 'var(--aura-risk)' : safe ? 'var(--aura-safe)' : 'var(--aura-accent)',
      background: risk ? 'rgba(239, 68, 68, 0.05)' : safe ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255, 255, 255, 0.03)'
    }}>
      {icon}
    </div>
    <div>
      <p className="aura-stat-val">{val}</p>
      <p className="aura-stat-label">{label}</p>
    </div>
  </div>
);

export default App;
