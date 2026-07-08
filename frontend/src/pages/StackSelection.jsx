import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  Search, Code, Database, Brain, Cloud, Terminal, Shield, AppWindow, Eye, MessageSquare, Cpu, 
  Clock, Award, ShieldCheck, ArrowRight, Layers, Palette, ShieldAlert
} from 'lucide-react';

const StackSelection = ({ onSelectStack }) => {
  const [selectedStack, setSelectedStack] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const { user } = useContext(AuthContext);

  const categories = ['All', 'Full Stack & Development', 'Data & AI', 'Cloud & DevOps', 'QA & Design'];

  const stacks = [
    { name: 'Java Full Stack', category: 'Full Stack & Development', icon: <Code size={24} />, color: '#e76f51', desc: 'Enterprise Java applications with Spring Boot & Angular/React.' },
    { name: 'Python Full Stack', category: 'Full Stack & Development', icon: <Terminal size={24} />, color: '#4cc9f0', desc: 'High-performance Python backends with Django/FastAPI.' },
    { name: 'MERN Stack', category: 'Full Stack & Development', icon: <Layers size={24} />, color: '#6366f1', desc: 'Full-stack Javascript using MongoDB, Express, React, & Node.' },
    { name: 'MEAN Stack', category: 'Full Stack & Development', icon: <Layers size={24} />, color: '#8b5cf6', desc: 'Full-stack Javascript using MongoDB, Express, Angular, & Node.' },
    { name: '.NET Full Stack', category: 'Full Stack & Development', icon: <Cpu size={24} />, color: '#7209b7', desc: 'Enterprise applications with C#, ASP.NET Core, & SQL Server.' },
    { name: 'Frontend Development', category: 'Full Stack & Development', icon: <AppWindow size={24} />, color: '#06b6d4', desc: 'UI interfaces with HTML/CSS, Modern JS, & SPA frameworks.' },
    { name: 'Backend Development', category: 'Full Stack & Development', icon: <Database size={24} />, color: '#f59e0b', desc: 'Server architectures, microservices, APIs, and databases.' },
    { name: 'Full Stack Development', category: 'Full Stack & Development', icon: <Code size={24} />, color: '#10b981', desc: 'End-to-end software architectures and system handshakes.' },
    { name: 'Mobile App Development', category: 'Full Stack & Development', icon: <AppWindow size={24} />, color: '#f43f5e', desc: 'Native and cross-platform apps using Flutter, React Native, or Swift/Kotlin.' },

    { name: 'AI/ML', category: 'Data & AI', icon: <Brain size={24} />, color: '#ec4899', desc: 'Predictive modeling, regression, neural networks, & classical ML.' },
    { name: 'Generative AI (GenAI)', category: 'Data & AI', icon: <Cpu size={24} />, color: '#14b8a6', desc: 'Transformers, Large Language Models (LLMs), RAG, & fine-tuning.' },
    { name: 'Data Science', category: 'Data & AI', icon: <Database size={24} />, color: '#0ea5e9', desc: 'Hypothesis testing, statistical analysis, and machine learning.' },
    { name: 'Data Analytics', category: 'Data & AI', icon: <Layers size={24} />, color: '#84cc16', desc: 'SQL querying, BI visualization, Pandas data analysis, & insights.' },
    { name: 'Data Engineering', category: 'Data & AI', icon: <Database size={24} />, color: '#f97316', desc: 'Hadoop, Spark pipelines, data warehousing, and ETL engines.' },
    { name: 'Computer Vision', category: 'Data & AI', icon: <Eye size={24} />, color: '#6366f1', desc: 'Convolutional neural networks (CNNs), OpenCV, & image segmentation.' },
    { name: 'Natural Language Processing (NLP)', category: 'Data & AI', icon: <MessageSquare size={24} />, color: '#06b6d4', desc: 'Text tokenization, sentiment analysis, word vectors, & BERT.' },
    { name: 'MLOps', category: 'Data & AI', icon: <Terminal size={24} />, color: '#8b5cf6', desc: 'Model deployment, versioning, MLflow pipelines, & monitoring.' },

    { name: 'Cloud Computing', category: 'Cloud & DevOps', icon: <Cloud size={24} />, color: '#3b82f6', desc: 'AWS/Azure services, cloud architectures, IAM, & scalability.' },
    { name: 'DevOps', category: 'Cloud & DevOps', icon: <Terminal size={24} />, color: '#ef4444', desc: 'CI/CD automation, Docker containers, Kubernetes orchestration, & IaC.' },
    { name: 'Cybersecurity', category: 'Cloud & DevOps', icon: <Shield size={24} />, color: '#10b981', desc: 'Cryptography, network firewalls, penetration testing, & zero trust.' },

    { name: 'UI/UX Design', category: 'QA & Design', icon: <Palette size={24} />, color: '#ec4899', desc: 'Wireframing, accessibility (WCAG), user journeys, & design systems.' },
    { name: 'Manual Testing', category: 'QA & Design', icon: <ShieldAlert size={24} />, color: '#f59e0b', desc: 'Test cases, STLC lifecycle, regression tests, and bug validation.' }
  ];

  // Filtering stacks based on search and active category tab
  const filteredStacks = stacks.filter(stack => {
    const matchesSearch = stack.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          stack.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || stack.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleStart = () => {
    if (selectedStack) {
      onSelectStack(selectedStack);
    }
  };

  return (
    <div className="animate-fade" style={{ width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
          Welcome, <span style={{ color: '#6366f1' }}>{user?.name}</span>!
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
          Select your specialization track from our 22 Hexaware internship options to launch your eligibility assessment.
        </p>
      </div>

      {/* Search and Tabs Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '500px', margin: '0 auto' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search specialization stack..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '48px', borderRadius: '30px', background: 'rgba(0,0,0,0.3)' }}
          />
        </div>

        {/* Categories Tab */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={activeCategory === cat ? 'glow-btn' : 'secondary-btn'}
              style={{
                padding: '8px 16px',
                fontSize: '0.85rem',
                borderRadius: '20px',
                boxShadow: activeCategory === cat ? '0 2px 8px rgba(99, 102, 241, 0.2)' : 'none'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Layout */}
      <div className="stacks-grid" style={{ minHeight: '300px' }}>
        {filteredStacks.map((stack) => {
          const isSelected = selectedStack === stack.name;
          return (
            <div
              key={stack.name}
              className={`glass-card stack-card ${isSelected ? 'selected-card' : ''}`}
              onClick={() => setSelectedStack(stack.name)}
              style={{
                borderWidth: isSelected ? '2px' : '1px',
                borderColor: isSelected ? 'var(--primary)' : 'var(--card-border)',
                boxShadow: isSelected ? 'var(--shadow-glow)' : 'var(--shadow-md)',
                transform: isSelected ? 'scale(1.02)' : 'none',
                padding: '24px'
              }}
            >
              <div
                className="stack-icon"
                style={{
                  background: isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                  color: isSelected ? '#ffffff' : stack.color,
                  width: '48px',
                  height: '48px',
                  marginBottom: '16px'
                }}
              >
                {stack.icon}
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>{stack.name}</h3>
              <p style={{ fontSize: '0.8rem', color: '#6366f1', marginBottom: '8px', fontWeight: '500' }}>
                {stack.category}
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                {stack.desc}
              </p>
            </div>
          );
        })}
      </div>

      {filteredStacks.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          No matching specialization tracks found. Try searching for other terms!
        </div>
      )}

      {selectedStack && (
        <div
          className="glass-card animate-fade"
          style={{
            marginTop: '40px',
            padding: '24px 32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            background: 'rgba(99, 102, 241, 0.05)',
            borderColor: 'rgba(99, 102, 241, 0.2)',
          }}
        >
          <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} style={{ color: '#10b981' }} />
            <span>Eligibility Exam Terms: {selectedStack}</span>
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={16} />
              <span>30 Questions | 30 Minutes</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={16} style={{ color: 'var(--warning)' }} />
              <span>1 Minute Per Question Limit</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Award size={16} style={{ color: 'var(--success)' }} />
              <span>75% (23 Correct) Passing Score</span>
            </div>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            *Note: If the 1-minute question timer runs out, your answer for that question will be locked and you will automatically proceed to the next question.
          </p>

          <button
            onClick={handleStart}
            className="glow-btn"
            style={{ alignSelf: 'flex-start', padding: '14px 28px' }}
          >
            <span>Start Test Now</span>
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default StackSelection;
