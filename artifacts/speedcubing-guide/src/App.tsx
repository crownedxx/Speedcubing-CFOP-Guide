import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUpRight, BookOpen, Check, ChevronDown, CircleHelp, Clock3, Cuboid, Eye, Gauge, Menu, MoveUpRight, Rotate3D, Search, Sparkles, X } from 'lucide-react';
import { allCases, f2lCases, ollCases, pllCases, twoLookOll, twoLookPll, type AlgorithmCase } from '@/data/algorithms';
import { CubePreview } from '@/components/CubePreview';

const navigation = [
  { label: 'Start here', href: '#start', index: '00' },
  { label: 'The CFOP method', href: '#method', index: '01' },
  { label: 'F2L pair library', href: '#f2l', index: '02' },
  { label: 'Two-look last layer', href: '#two-look', index: '03' },
  { label: 'Algorithm library', href: '#library', index: '04' },
  { label: 'Notation & technique', href: '#notation', index: '05' },
];

function App() {
  const [activeCase, setActiveCase] = useState<AlgorithmCase>(allCases[0]);
  const [search, setSearch] = useState('');
  const [stepFilter, setStepFilter] = useState<'All' | 'OLL' | 'PLL'>('All');
  const [groupFilter, setGroupFilter] = useState('All families');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showAllF2l, setShowAllF2l] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    document.title = 'Turn by Turn — The CFOP Field Guide';
    let description = document.querySelector('meta[name="description"]');
    if (!description) {
      description = document.createElement('meta');
      description.setAttribute('name', 'description');
      document.head.appendChild(description);
    }
    description.setAttribute('content', 'A hands-on CFOP field guide: learn cross, F2L, all 57 OLL and 21 PLL cases with an interactive 3D cube lab.');
  }, []);

  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName ?? '');
      if (event.key === '/' && !typing) {
        event.preventDefault();
        document.querySelector<HTMLInputElement>('[data-testid="input-search-cases"]')?.focus();
      }
      if (event.key === 'Escape') {
        setMobileNavOpen(false);
        (target?.tagName === 'INPUT' ? target : null)?.blur();
      }
    };
    window.addEventListener('keydown', onShortcut);
    return () => window.removeEventListener('keydown', onShortcut);
  }, []);

  const groups = useMemo(() => {
    const subset = stepFilter === 'All' ? allCases : allCases.filter((item) => item.step === stepFilter);
    return ['All families', ...Array.from(new Set(subset.map((item) => item.group)))];
  }, [stepFilter]);

  const visibleCases = useMemo(() => allCases.filter((item) => {
    const query = search.trim().toLowerCase();
    return (stepFilter === 'All' || item.step === stepFilter)
      && (groupFilter === 'All families' || item.group === groupFilter)
      && (!query || `${item.name} ${item.family} ${item.recognition} ${item.algorithm}`.toLowerCase().includes(query));
  }), [search, stepFilter, groupFilter]);

  const preview = (item: AlgorithmCase) => {
    setActiveCase(item);
    setNotice(`${item.name} loaded in the cube lab`);
    window.setTimeout(() => setNotice(''), 2600);
    window.setTimeout(() => document.getElementById('cube-lab')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60);
  };
  const previewSequence = (title: string, algorithm: string) => preview({
    id: `lesson-${title}`, name: title, family: 'Two-look lesson', recognition: 'Practice this step as a short, repeatable sequence.', algorithm, step: 'OLL', group: 'Lesson',
  });

  return (
    <div className="guide-shell">
      <aside className="sidebar">
        <a href="#start" className="brand" aria-label="Turn by Turn home" data-testid="link-home">
          <span className="brand-mark"><Cuboid size={22} strokeWidth={1.8} /></span>
          <span><strong>TURN BY TURN</strong><small>THE CFOP FIELD GUIDE</small></span>
        </a>
        <div className="sidebar-section-label">YOUR ROUTE</div>
        <nav className="side-nav" aria-label="Guide sections">
          {navigation.map((item) => <a href={item.href} onClick={() => setMobileNavOpen(false)} key={item.href} data-testid={`link-nav-${item.index}`}>
            <span className="nav-index">{item.index}</span><span>{item.label}</span><ArrowUpRight size={13} />
          </a>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="side-note">
            <span className="side-note-icon"><Rotate3D size={16} /></span>
            <p>Every case is a lesson.<br /><b>Drag the cube. Turn by turn.</b></p>
          </div>
          <div className="sidebar-footer"><span>BUILT FOR THE SOLVE</span><span className="sidebar-dot" /> LOCAL · OFFLINE READY</div>
        </div>
      </aside>

      <main className="main-content">
        <header className="mobile-header">
          <a href="#start" className="mobile-brand"><Cuboid size={19} /> TURN BY TURN</a>
          <button type="button" onClick={() => setMobileNavOpen(!mobileNavOpen)} aria-label={mobileNavOpen ? 'Close navigation' : 'Open navigation'} data-testid="button-mobile-menu">{mobileNavOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </header>
        {mobileNavOpen && <nav className="mobile-nav" aria-label="Mobile guide sections">{navigation.map((item) => <a href={item.href} onClick={() => setMobileNavOpen(false)} key={item.href}>{item.label}<ArrowUpRight size={14} /></a>)}</nav>}
        <div className="topline"><span><span className="live-dot" /> A PRACTICAL CFOP FIELD GUIDE</span><span className="topline-right">BUILT FOR YOUR NEXT PB <MoveUpRight size={13} /></span></div>

        <section className="hero paper-grid" id="start">
          <div className="hero-copy enter">
            <span className="eyebrow hero-kicker"><span>FIELD NOTES / 001</span><span className="kicker-line" /> FROM FIRST CROSS TO FULL PLL</span>
            <h1>Make every<br /><em>turn</em> count<span className="period">.</span></h1>
            <p className="hero-deck">A hands-on guide to CFOP, built for the moment you stop learning moves and start understanding the solve.</p>
            <div className="hero-actions">
              <a href="#method" className="button-primary" data-testid="link-start-learning">Start the route <ArrowDown size={15} /></a>
              <a href="#library" className="button-text">Browse all cases <ArrowUpRight size={15} /></a>
            </div>
            <div className="hero-metrics" aria-label="Guide contents">
              <div><strong>4</strong><span>STEPS IN CFOP</span></div>
              <div><strong>57<span>+</span>21</strong><span>LAST-LAYER CASES</span></div>
              <div><strong>01</strong><span>ROTATABLE CUBE LAB</span></div>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="orbit orbit-a" /><div className="orbit orbit-b" />
            <div className="hero-cube-glyph"><span /><span /><span /><span /><span /><span /><span /><span /><span /></div>
            <div className="hero-caption mono">40° 41′ N / EVERYWHERE</div>
            <div className="hero-art-label"><span className="eyebrow">THE PRACTICE IS THE POINT</span><b>Notice.<br />Understand.<br /><i>Execute.</i></b></div>
          </div>
        </section>

        <div className="content-wrap">
          <div className="intro-strip">
            <div className="intro-mark">01 <span>/ 06</span></div>
            <p>Speed comes from clarity. Start with the shape of the method, then learn the pieces in a way that sticks.</p>
            <span className="intro-side mono">SCROLL TO EXPLORE <ArrowDown size={13} /></span>
          </div>

          <section id="method" className="section-block method-section">
            <SectionHeading number="01" eyebrow="THE FRAMEWORK" title="Four steps. One solve." copy="CFOP turns a chaotic scramble into a repeatable route. Learn the logic before chasing the algorithm count." />
            <div className="method-rail">
              {[
                { id: 'C', name: 'Cross', desc: 'Build a four-edge cross on the bottom. Plan it before you turn.', detail: '4 edges · intuitive', color: 'coral' },
                { id: 'F', name: 'F2L', desc: 'Pair each corner with its edge, then insert both into a slot.', detail: '4 pairs · look ahead', color: 'mint' },
                { id: 'O', name: 'OLL', desc: 'Orient the last layer so every top sticker faces upward.', detail: '57 cases · 2-look first', color: 'gold' },
                { id: 'P', name: 'PLL', desc: 'Permute the last layer pieces. One final algorithm completes the solve.', detail: '21 cases · recognize fast', color: 'blue' },
              ].map((item, index) => <article className={`method-card ${item.color}`} key={item.id} data-testid={`card-method-${item.id}`}>
                <div className="method-card-top"><span className="method-number">0{index + 1}</span><span className="method-glyph">{item.id}</span></div>
                <h3>{item.name}</h3><p>{item.desc}</p><div className="method-detail"><span />{item.detail}</div>
              </article>)}
            </div>
            <div className="method-footnote"><span className="footnote-star">✳</span><span><b>Learn the why before the what.</b> A good F2L solve is built from pair logic, not a memorized list of 41 moves.</span><a href="#f2l">Explore F2L <ArrowUpRight size={13} /></a></div>
          </section>

          <section id="cube-lab" className="section-block lab-section">
            <div className="lab-header">
              <div><span className="eyebrow section-eyebrow"><span className="section-num">02</span> HANDS-ON PRACTICE</span><h2>See the turn.<br /><em>Feel the sequence.</em></h2></div>
              <p>Every Preview button lands here. Step through the layer turns, inspect a move, then drag the cube to find your angle.</p>
            </div>
            <CubePreview algorithm={activeCase.algorithm} caseName={activeCase.name} />
            <div className="lab-note"><span><Eye size={15} /> <b>What to watch:</b> the selected layer moves while every sticker stays attached.</span><span className="mono">3D / LAYER-BASED / TOUCH READY</span></div>
          </section>

          <section id="f2l" className="section-block f2l-section">
            <SectionHeading number="03" eyebrow="FIRST TWO LAYERS" title="Pair, align, insert." copy="F2L is four small puzzles. Read the corner and edge together, find a clean way to pair them, and keep the solved cross intact." />
            <div className="f2l-lesson panel">
              <div className="f2l-lesson-intro"><span className="eyebrow">THE USEFUL LOOP</span><div className="loop-steps"><div><span>01</span><b>Find</b><small>Target corner + matching edge</small></div><i>→</i><div><span>02</span><b>Pair</b><small>Join them above the slot</small></div><i>→</i><div><span>03</span><b>Insert</b><small>Drop pair into open slot</small></div></div></div>
              <div className="f2l-cue"><span className="eyebrow">A GOOD DEFAULT</span><code className="algorithm">R U R' U'</code><p>Open the slot, connect the pair, close without breaking the cross. Reverse the hands for a left-slot insert.</p></div>
            </div>
            <div className="f2l-grid">
              {(showAllF2l ? f2lCases : f2lCases.slice(0, 6)).map((item, index) => <article key={item.id} className="f2l-card panel" data-testid={`card-f2l-${item.id}`}>
                <div className="f2l-card-meta"><span className="case-index">PAIR / {String(index + 1).padStart(2, '0')}</span><span className="case-tag">{item.type}</span></div>
                <h3>{item.title}</h3><p>{item.cue}</p>
                <div className="f2l-alg"><code className="algorithm">{item.algorithm}</code><button type="button" onClick={() => previewSequence(item.title, item.algorithm)} aria-label={`Preview ${item.title}`} data-testid={`button-preview-f2l-${item.id}`}><Rotate3D size={15} /> Preview</button></div>
                <div className="f2l-note"><CircleHelp size={13} /> {item.note}</div>
              </article>)}
            </div>
            <button type="button" className="underlined-button" onClick={() => setShowAllF2l(!showAllF2l)} data-testid="button-toggle-f2l">{showAllF2l ? 'Show the core six' : 'Show all 12 pair patterns'} <ChevronDown size={15} className={showAllF2l ? 'rotate-chevron' : ''} /></button>
          </section>

          <section id="two-look" className="section-block two-look-section">
            <SectionHeading number="04" eyebrow="A SMART ON-RAMP" title="Two-look last layer." copy="Solve OLL in two stages, then PLL in two. Four dependable checkpoints get you to a solved cube before full recognition takes over." />
            <div className="two-look-column">
              <article className="look-panel oll-look">
                <header><span className="look-badge">OLL</span><div><span className="eyebrow">TWO LOOK / ORIENTATION</span><h3>Edges first. Corners second.</h3></div><span className="look-count">02 MOVES</span></header>
                <div className="look-steps">
                  {twoLookOll.map((item, index) => <div className="look-step" key={item.title}>
                    <div className="look-step-no">0{index + 1}</div><div className="look-step-copy"><h4>{item.title}</h4><p>{item.cue}</p><div className="mini-variants">{item.alternatives.map((alt) => <button type="button" key={alt.label} onClick={() => previewSequence(`${alt.label} · two-look OLL`, alt.algorithm)} data-testid={`button-preview-${alt.label.toLowerCase().replaceAll(' ', '-')}`}><span>{alt.label}</span><code className="algorithm">{alt.algorithm}</code><Rotate3D size={14} /></button>)}</div></div>
                  </div>)}
                </div>
                <div className="look-foot"><Sparkles size={15} /> Cross, line, L, or dot? Orient the edges before you read the corners.</div>
              </article>
              <article className="look-panel pll-look">
                <header><span className="look-badge">PLL</span><div><span className="eyebrow">TWO LOOK / PERMUTATION</span><h3>Corners first. Edges second.</h3></div><span className="look-count">02 MOVES</span></header>
                <div className="look-steps">
                  {twoLookPll.map((item, index) => <div className="look-step" key={item.title}>
                    <div className="look-step-no">0{index + 1}</div><div className="look-step-copy"><h4>{item.title}</h4><p>{item.cue}</p><div className="mini-variants">{item.alternatives.map((alt) => <button type="button" key={alt.label} onClick={() => previewSequence(`${alt.label} · two-look PLL`, alt.algorithm)} data-testid={`button-preview-${alt.label.toLowerCase()}-permutation`}><span>{alt.label}</span><code className="algorithm">{alt.algorithm}</code><Rotate3D size={14} /></button>)}</div></div>
                  </div>)}
                </div>
                <div className="look-foot"><Check size={15} /> Once corners are home, choose the edge cycle that matches what remains.</div>
              </article>
            </div>
          </section>

          <section id="library" className="section-block library-section">
            <div className="library-heading">
              <div><span className="eyebrow section-eyebrow"><span className="section-num">05</span> THE ALGORITHM INDEX</span><h2>Every last-layer<br /><em>case, in reach.</em></h2></div>
              <div className="library-stats"><div><b>57</b><span>OLL CASES</span></div><div><b>21</b><span>PLL CASES</span></div></div>
            </div>
            <p className="library-deck">Search by case, shape, or move. Filter the set, study the recognition cue, then inspect the algorithm in the live cube lab.</p>
            <div className="library-toolbar">
              <label className="search-box"><Search size={17} /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a case, shape, or move…" aria-label="Search algorithm cases" data-testid="input-search-cases" /><kbd>/</kbd></label>
              <div className="filter-tabs" role="group" aria-label="Filter by CFOP step">{(['All', 'OLL', 'PLL'] as const).map((filter) => <button type="button" key={filter} className={stepFilter === filter ? 'active' : ''} onClick={() => { setStepFilter(filter); setGroupFilter('All families'); }} data-testid={`button-filter-${filter.toLowerCase()}`}>{filter}<span>{filter === 'All' ? '78' : filter === 'OLL' ? '57' : '21'}</span></button>)}</div>
              <label className="family-select"><span className="sr-only">Case family</span><select value={groupFilter} onChange={(event) => setGroupFilter(event.target.value)} aria-label="Filter by case family" data-testid="select-case-family">{groups.map((group) => <option key={group}>{group}</option>)}</select><ChevronDown size={14} /></label>
            </div>
            <div className="library-result-line"><span data-testid="text-case-count">{visibleCases.length} CASES</span><span>ALGORITHMS SHOWN IN STANDARD NOTATION</span></div>
            {visibleCases.length ? <div className="case-grid">
              {visibleCases.map((item) => <article className="case-card panel" key={item.id} data-testid={`card-case-${item.id}`}>
                <div className="case-card-top"><div><span className={`case-step ${item.step.toLowerCase()}`}>{item.step}</span><span className="case-label">{item.name}</span></div><span className="case-group">{item.group}</span></div>
                <h3>{item.family}</h3><p className="case-recognition">{item.recognition}</p>
                <code className="case-alg algorithm">{item.algorithm}</code>
                <div className="case-card-bottom"><span className="move-count"><Clock3 size={12} /> {item.algorithm.split(/\s+/).length} MOVES</span><button type="button" className="preview-button" onClick={() => preview(item)} data-testid={`button-preview-${item.id}`}><Rotate3D size={14} /> Preview</button></div>
              </article>)}
            </div> : <div className="empty-results"><Search size={23} /><h3>No case matches that search.</h3><p>Try a case number like OLL 27, a family such as Line, or a move like R U.</p><button type="button" onClick={() => { setSearch(''); setGroupFilter('All families'); setStepFilter('All'); }} data-testid="button-clear-search">Clear filters</button></div>}
            <div className="library-footnote"><span><BookOpen size={15} /> Notation is written from the solver’s point of view. Keep the top layer facing up.</span><span>DATA BUNDLED LOCALLY · {ollCases.length} OLL / {pllCases.length} PLL</span></div>
          </section>

          <section id="notation" className="section-block notation-section">
            <SectionHeading number="06" eyebrow="READ THE LANGUAGE" title="Notation, without the guesswork." copy="Each letter names a face. The mark after it tells you which direction and how far to turn." />
            <div className="notation-grid">
              <div className="notation-card panel">
                <div className="notation-card-title"><span className="eyebrow">THE SIX FACES</span><span className="mono">VIEW FROM THE SOLVER</span></div>
                <div className="face-grid">{[['U', 'Up', 'top'], ['D', 'Down', 'bottom'], ['R', 'Right', 'right'], ['L', 'Left', 'left'], ['F', 'Front', 'front'], ['B', 'Back', 'back']].map(([letter, label, color]) => <div className="face-row" key={letter}><span className={`face-chip ${color}`}>{letter}</span><b>{label}</b><span>{label === 'Front' ? 'facing you' : label === 'Back' ? 'away from you' : `the ${label.toLowerCase()} face`}</span></div>)}</div>
                <div className="notation-hint"><CircleHelp size={15} /> Imagine looking directly at the named face: clockwise is always from that face’s point of view.</div>
              </div>
              <div className="notation-card panel turn-reference">
                <div className="notation-card-title"><span className="eyebrow">TURN MARKS</span><span className="mono">1 TURN = 90°</span></div>
                {[['R', 'Quarter turn clockwise', '90°'], ["R'", 'Quarter turn counter-clockwise', '90°'], ['R2', 'Half turn, either direction', '180°'], ['r / Rw', 'Wide turn: outer + middle slice', '2 layers'], ['M / E / S', 'Middle slices; match L / D / F', '1 layer'], ['x / y / z', 'Rotate the whole cube like R / U / F', 'whole cube'], ['(U)', 'Setup move: adjust the top before a case', 'before alg']].map(([symbol, desc, tag]) => <div className="turn-row" key={symbol}><code className="turn-symbol">{symbol}</code><span>{desc}</span><small>{tag}</small></div>)}
              </div>
            </div>
            <div className="technique-panel">
              <div className="technique-lead"><span className="eyebrow">THE HUMAN PART</span><h3>Algorithms are only<br />half the solve.</h3><p>Recognition and rhythm do the quiet work between turns.</p></div>
              <div className="technique-item"><span className="tech-number">01</span><h4>Learn a chunk, not a string</h4><p>Group moves into triggers: <code className="algorithm">R U R' U'</code> is one familiar unit, not four isolated symbols.</p></div>
              <div className="technique-item"><span className="tech-number">02</span><h4>Look for the shape</h4><p>Recognize headlights, bars, blocks, and edge patterns. A case name is a cue, not a test.</p></div>
              <div className="technique-item"><span className="tech-number">03</span><h4>Train slow, then smooth</h4><p>Repeat with deliberate finger tricks. Add speed only when the sequence stays clean and relaxed.</p></div>
            </div>
            <div className="practice-ribbon"><div className="ribbon-icon"><Gauge size={20} /></div><div><span className="eyebrow">A PRACTICE LOOP THAT WORKS</span><b>Recognize → execute → reset → repeat.</b></div><p>Drill a handful of cases until the recognition happens before your hands finish the last turn.</p><a href="#library">Choose a case <ArrowUpRight size={14} /></a></div>
          </section>

          <footer className="site-footer"><a href="#start" className="footer-brand"><Cuboid size={20} /> TURN BY TURN</a><span>THE CFOP FIELD GUIDE · MADE FOR CUBERS, BY CUBERS</span><a href="#start">BACK TO THE TOP <ArrowUpRight size={12} /></a></footer>
        </div>
      </main>
      {notice && <div className="toast-note" role="status" data-testid="status-preview-loaded"><Check size={15} /> {notice}</div>}
    </div>
  );
}

function SectionHeading({ number, eyebrow, title, copy }: { number: string; eyebrow: string; title: string; copy: string }) {
  return <div className="section-heading">
    <div className="section-heading-main"><span className="eyebrow section-eyebrow"><span className="section-num">{number}</span> {eyebrow}</span><h2>{title.split('\n').map((line, index) => <span key={index}>{index > 0 && <br />}{line.includes(' in reach.') ? <em>{line}</em> : line}</span>)}</h2></div>
    <p>{copy}</p>
  </div>;
}

export default App;
