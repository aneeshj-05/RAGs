import { motion } from 'framer-motion';
import { ArrowRight, Check, FileText, Search, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const features = [
  {
    title: 'Upload folders or individual PDFs.',
    body: 'Drop a research folder, policy archive, case bundle, or a single PDF. DocIntel keeps the file list readable as your collection grows.',
    label: '12 PDFs indexed',
    mock: 'folder',
  },
  {
    title: 'Semantic Retrieval',
    body: 'Questions are matched against meaning, not just keywords, so the answer is built from the document sections that actually matter.',
    label: '4 relevant chunks found',
    mock: 'retrieval',
  },
  {
    title: 'Source Citations',
    body: 'Every answer carries its evidence forward: filenames, chunk references, and source previews stay close to the response.',
    label: 'Cited from source',
    mock: 'citation',
  },
  {
    title: 'Fast Search',
    body: 'Vector indexing keeps large collections responsive, turning long manual review sessions into focused conversations.',
    label: 'Answered in seconds',
    mock: 'speed',
  },
];

function MiniMockup({ type, label }: { type: string; label: string }) {
  return (
    <div className="mock-surface" aria-hidden="true">
      <div className="mock-toolbar">
        <span />
        <span />
        <span />
      </div>
      {type === 'folder' && (
        <div className="mock-list">
          {['Annual report.pdf', 'Board memo.pdf', 'Risk appendix.pdf'].map((file, index) => (
            <div className="mock-file" key={file}>
              <FileText size={16} />
              <span>{file}</span>
              <small>{index === 0 ? 'Indexed' : 'Ready'}</small>
            </div>
          ))}
        </div>
      )}
      {type === 'retrieval' && (
        <div className="mock-query">
          <div>Which deadlines are mentioned?</div>
          <span>Matched by concept: due dates, timeline, submission</span>
          <div className="mock-bars"><i /><i /><i /></div>
        </div>
      )}
      {type === 'citation' && (
        <div className="mock-answer">
          <p>The document lists four priority risks and ties each one to a mitigation owner.</p>
          <button>Source: Risk appendix, chunk 03</button>
        </div>
      )}
      {type === 'speed' && (
        <div className="mock-speed">
          <strong>0.8s</strong>
          <span>retrieval latency</span>
          <div className="mock-grid"><i /><i /><i /><i /><i /><i /></div>
        </div>
      )}
      <div className="mock-footnote">{label}</div>
    </div>
  );
}

function HeroProductMockup() {
  return (
    <motion.div className="hero-product" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }} aria-label="DocIntel AI product preview">
      <aside>
        <div className="mini-brand"><FileText size={16} /> Library</div>
        {['Greedy Algorithms.pdf', 'Placement Guide.pdf', 'Interview Notes.pdf'].map((file, index) => (
          <div className="hero-file" key={file}>
            <FileText size={15} />
            <span>{file}</span>
            <small>{index === 0 ? 'ready' : 'indexed'}</small>
          </div>
        ))}
      </aside>
      <main>
        <div className="hero-search"><Search size={17} /> What are the most important topics?</div>
        <div className="hero-answer">
          <span>Answer</span>
          <p>The uploaded guide focuses on greedy algorithms, including activity selection, job sequencing, fractional knapsack, Huffman encoding, and related placement problems.</p>
        </div>
        <div className="hero-citations">
          <button>Greedy Algorithms.pdf - chunk 1</button>
          <button>Placement Guide.pdf - chunk 2</button>
        </div>
      </main>
    </motion.div>
  );
}

export function LandingPage() {
  return (
    <div className="site-shell">
      <header className="landing-nav">
        <Link to="/" className="brand-mark" aria-label="DocIntel AI home"><span>DI</span> DocIntel AI</Link>
        <nav aria-label="Primary navigation">
          <a href="#about">About</a>
          <a href="#features">Features</a>
          <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
          <a href="#docs">Documentation</a>
        </nav>
        <Link className="nav-cta" to="/workspace">Chat with your Documents</Link>
      </header>

      <main>
        <section id="about" className="hero-section">
          <motion.div className="hero-copy" initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.6 }}>
            <p className="eyebrow"><Sparkles size={15} /> Document intelligence for serious reading</p>
            <h1>Ask questions across hundreds of documents in seconds.</h1>
            <p className="hero-subcopy">Upload one or many PDFs and instantly retrieve accurate, citation-backed answers powered by semantic search and AI.</p>
            <div className="hero-actions">
              <Link className="primary-link" to="/workspace">Chat with your Documents <ArrowRight size={17} /></Link>
              <a className="quiet-link" href="#features">See how it works</a>
            </div>
          </motion.div>
          <HeroProductMockup />
        </section>

        <section id="features" className="feature-stack">
          {features.map((feature, index) => (
            <motion.article className={`feature-row ${index % 2 ? 'reverse' : ''}`} key={feature.title} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeUp} transition={{ duration: 0.45 }}>
              <div className="feature-copy">
                <span>0{index + 1}</span>
                <h2>{feature.title}</h2>
                <p>{feature.body}</p>
              </div>
              <MiniMockup type={feature.mock} label={feature.label} />
            </motion.article>
          ))}
        </section>

        <section className="timeline-section" id="docs">
          <div className="section-heading">
            <span>How it works</span>
            <h2>From document pile to cited answer.</h2>
          </div>
          <div className="timeline">
            {['Upload documents', 'Index documents', 'Ask questions', 'Receive accurate answers with citations'].map((step, index) => (
              <motion.div className="timeline-step" key={step} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }}>
                <strong>{index + 1}</strong>
                <span>{step}</span>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="comparison-section">
          <div className="section-heading">
            <span>Why DocIntel?</span>
            <h2>Less searching. More knowing.</h2>
          </div>
          <div className="comparison-table" role="table" aria-label="Traditional search compared with DocIntel AI">
            <div className="comparison-column muted">
              <h3>Traditional Search</h3>
              {['Manual searching', 'Read hundreds of pages', 'No context'].map((item) => <p key={item}>x {item}</p>)}
            </div>
            <div className="comparison-column strong">
              <h3>DocIntel AI</h3>
              {['Semantic Search', 'Natural language questions', 'Citation-backed responses', 'Instant retrieval'].map((item) => <p key={item}><Check size={17} /> {item}</p>)}
            </div>
          </div>
        </section>

        <section className="final-cta">
          <h2>Ready to search your documents smarter?</h2>
          <Link className="primary-link" to="/workspace">Chat with your Documents <ArrowRight size={17} /></Link>
        </section>
      </main>
    </div>
  );
}
