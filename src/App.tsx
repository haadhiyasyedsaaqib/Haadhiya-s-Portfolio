import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown, ArrowDownRight, ArrowRight, ArrowUpRight, Compass, Download, FileText, GraduationCap, Mail, Menu, Plane, ShieldCheck, Sparkles, X } from 'lucide-react'
import { portfolio } from './data'

const nav = ['Home', 'About', 'Education', 'Interests', 'Projects', 'Video', 'Skills', 'Resume', 'Contact']
const interestIcons = [<Plane key="plane"/>, <ShieldCheck key="safety"/>, <ArrowUpRight key="economics"/>, <Sparkles key="passenger"/>, <Compass key="sustainability"/>, <ArrowRight key="technology"/>]

function AircraftFlight() {
  const host = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const root = host.current
    const plane = root?.querySelector<HTMLElement>('.flight-unit')
    if (!root || !plane || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.registerPlugin(ScrollTrigger)
    type Point = { p: number; x: number; y: number; facing: number; scale: number; opacity: number; rotation: number }
    const clamp = (v:number,min:number,max:number) => Math.max(min,Math.min(max,v))
    let points:Point[]=[]
    let scaleBase=.44
    const measure=()=>{
      const width=innerWidth, height=innerHeight, max= Math.max(1,ScrollTrigger.maxScroll(window))
      scaleBase=width<=640?.56:.62
      const planeWidth=plane.offsetWidth*scaleBase
      const edge=width/2+planeWidth*.62
      const runway=document.querySelector<HTMLElement>('#home .runway-lines')?.getBoundingClientRect()
      const landY=clamp(((runway?.top??height*.58)+scrollY)+(runway?.height??height*.25)*.68,height*.62,height*.84)
      const cruiseY=clamp(height*(width<=640?.84:.46),150,height*.82)
      const headings=Array.from(document.querySelectorAll<HTMLElement>('[data-flight-target]'))
      const markers=headings.map((el,i)=>{
        const r=el.getBoundingClientRect()
        return i===0?.035:clamp((r.top+scrollY+r.height*.5-height*.48)/max,.07,.96)
      })
      const bounds=markers
      for(let i=1;i<bounds.length;i++) bounds[i]=Math.max(bounds[i],bounds[i-1]+.045)
      const away=(p:number)=>scaleBase*(1-.55*p)
      const fade=(p:number)=>1-.62*p
      const pts:Point[]=[
        {p:0,x:width*.5,y:landY,facing:1,scale:scaleBase*.68,opacity:1,rotation:6},
        {p:.012,x:width*.5,y:landY+5,facing:1,scale:scaleBase*.72,opacity:1,rotation:6},
        {p:.02,x:width*.5,y:cruiseY,facing:1,scale:scaleBase*.72,opacity:1,rotation:6},
        {p:.034,x:-edge,y:cruiseY,facing:1,scale:away(.034),opacity:0,rotation:6},
      ]
      const sectionCount=headings.length
      for(let i=0;i<sectionCount;i++){
        const start=bounds[i]??.035
        const next=i===sectionCount-1?.99:(bounds[i+1]??.99)
        const direction=i%2===0?1:-1
        const from=direction===1?-edge:edge
        const to=direction===1?width+edge:-edge
        const end=Math.max(start+.025,next-.006)
        pts.push({p:start,x:from,y:cruiseY,facing:direction,scale:away(start),opacity:fade(start),rotation:direction===1?6:-6})
        pts.push({p:end,x:to,y:cruiseY,facing:direction,scale:away(end),opacity:fade(end),rotation:direction===1?6:-6})
        if(i<sectionCount-1) pts.push({p:next,x:to,y:cruiseY,facing:-direction,scale:away(next),opacity:0,rotation:direction===1?-6:6})
      }
      pts.push({p:1,x:width+edge,y:cruiseY,facing:1,scale:scaleBase*.14,opacity:.08,rotation:6})
      points=pts.sort((a,b)=>a.p-b.p)
    }
    const driver={p:0}
    const setX=gsap.quickSetter(plane,'x','px'), setY=gsap.quickSetter(plane,'y','px')
    const setSX=gsap.quickSetter(plane,'scaleX'), setSY=gsap.quickSetter(plane,'scaleY'), setOpacity=gsap.quickSetter(plane,'opacity'), setRotation=gsap.quickSetter(plane,'rotation','deg')
    const render=()=>{
      if(points.length<2)return
      const p=clamp(driver.p,0,1)
      let i=points.findIndex(pt=>pt.p>=p);if(i<1)i=1;if(i>=points.length)i=points.length-1
      const a=points[i-1],b=points[i],t=clamp((p-a.p)/Math.max(.000001,b.p-a.p),0,1)
      const smooth=t*t*(3-2*t),mix=(x:number,y:number,q:number)=>x+(y-x)*q
      setX(mix(a.x,b.x,smooth)-innerWidth/2);setY(mix(a.y,b.y,smooth)-innerHeight/2)
      const size=mix(a.scale,b.scale,smooth)
      setSX(size*mix(a.facing,b.facing,smooth));setSY(size);setRotation(mix(a.rotation,b.rotation,smooth));setOpacity(mix(a.opacity,b.opacity,smooth))
    }
    const ctx=gsap.context(()=>{
      gsap.set(plane,{left:'50%',top:'50%',xPercent:-50,yPercent:-50,transformOrigin:'50% 50%'})
      measure()
      const tl=gsap.timeline({scrollTrigger:{trigger:document.documentElement,start:'top top',end:()=>ScrollTrigger.maxScroll(window),scrub:.55,invalidateOnRefresh:true,onRefresh:()=>{measure();render()}}})
      tl.to(driver,{p:1,duration:1,ease:'none',onUpdate:render},0)
      ScrollTrigger.refresh()
    },root)
    return()=>ctx.revert()
  },[])
  return <div className="flight-layer" ref={host} aria-hidden="true"><div className="flight-unit"><span className="flight-trail"/><img className="flight-aircraft" src="/images/pink-aircraft.png" alt="" draggable="false"/></div></div>
}

function PinkCursor() {
  const host = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const cursor = host.current
    if (!cursor || window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const dot = cursor.querySelector<HTMLElement>('.cursor-dot')
    const ring = cursor.querySelector<HTMLElement>('.cursor-ring')
    if (!dot || !ring) return
    const syncCursorMode = () => {
      const enabled = window.innerWidth > 640
      document.body.classList.toggle('has-custom-cursor', enabled)
      cursor.classList.toggle('is-disabled', !enabled)
      if (!enabled) cursor.classList.remove('is-visible', 'is-pointer')
    }
    syncCursorMode()
    const dotX = gsap.quickSetter(dot, 'x', 'px')
    const dotY = gsap.quickSetter(dot, 'y', 'px')
    const ringX = gsap.quickTo(ring, 'x', { duration: .055, ease: 'power3.out' })
    const ringY = gsap.quickTo(ring, 'y', { duration: .055, ease: 'power3.out' })
    let rippleTimer = 0
    const move = (event: PointerEvent) => {
      if (window.innerWidth <= 640) return
      dotX(event.clientX); dotY(event.clientY)
      ringX(event.clientX); ringY(event.clientY)
      cursor.classList.add('is-visible')
    }
    const hover = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null
      cursor.classList.toggle('is-pointer', Boolean(target?.closest('a, button, [role="button"], .interest-card, .skill-card, .project-card')))
    }
    const click = (event: PointerEvent) => {
      if (event.button !== 0) return
      cursor.classList.remove('is-clicking')
      requestAnimationFrame(() => cursor.classList.add('is-clicking'))
      window.clearTimeout(rippleTimer)
      rippleTimer = window.setTimeout(() => cursor.classList.remove('is-clicking'), 420)
    }
    const leave = () => cursor.classList.remove('is-visible', 'is-pointer')
    document.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerover', hover, { passive: true })
    document.addEventListener('pointerdown', click, { passive: true })
    window.addEventListener('blur', leave)
    window.addEventListener('resize', syncCursorMode)
    return () => {
      document.body.classList.remove('has-custom-cursor')
      document.removeEventListener('pointermove', move)
      document.removeEventListener('pointerover', hover)
      document.removeEventListener('pointerdown', click)
      window.removeEventListener('blur', leave)
      window.removeEventListener('resize', syncCursorMode)
      window.clearTimeout(rippleTimer)
    }
  }, [])
  return <div className="custom-cursor" ref={host} aria-hidden="true"><span className="cursor-ring"/><span className="cursor-dot"/><span className="cursor-ripple"/></div>
}

function Portrait({small=false}:{small?:boolean}) { return <div className={`portrait-frame ${small?'portrait-small':''}`}><img src="/images/haadhiya-portrait.png" alt="Portrait of Haadhiya Syed Akbar, Aviation Management Student." /></div> }

function CertificateGallery() {
  return <section className="certificate-gallery" id="certificates" aria-labelledby="certificate-heading">
    <div className="certificate-gallery-heading"><div><span className="micro-label">COURSES & CREDENTIALS</span><h2 id="certificate-heading" data-flight-target="certificates">Certificates <em>& learning.</em></h2></div><p>Selected certificates and professional learning.</p></div>
    <div className="certificate-grid">{portfolio.certificates.map(certificate => <article className="certificate-card" key={certificate.file}>
      <h3>{certificate.title}</h3>
      {certificate.format === 'image' ? <a className="certificate-image-preview" href={certificate.file} target="_blank" rel="noreferrer" aria-label={`Open ${certificate.title} certificate`}><img src={certificate.file} alt={`${certificate.title} certificate awarded to Haadhiya Syed Akbar`} /></a> : <iframe className="certificate-pdf-preview" src={`${encodeURI(certificate.file)}#view=FitH`} title={`${certificate.title} certificate preview`} loading="lazy"/>}
      <div className="certificate-actions"><a href={certificate.file} target="_blank" rel="noreferrer">VIEW CERTIFICATE <ArrowUpRight size={13}/></a><a href={certificate.file} download>DOWNLOAD <Download size={13}/></a></div>
    </article>)}</div>
  </section>
}

function usePublicFile(path: string, mimePrefix: string) {
  const [available, setAvailable] = useState(false)
  useEffect(() => {
    let active = true
    fetch(path, { method: 'HEAD' }).then(response => {
      const contentType = response.headers.get('content-type') ?? ''
      if (active) setAvailable(response.ok && contentType.toLowerCase().startsWith(mimePrefix))
    }).catch(() => { if (active) setAvailable(false) })
    return () => { active = false }
  }, [path, mimePrefix])
  return available
}

function ResumePage() {
  const available = usePublicFile('/resume.pdf', 'application/pdf')
  return <div className="contact-page"><header className="contact-page-header"><a className="brand" href="/"><span className="brand-mark"><Plane size={17}/></span><span>HAADHIYA <i>SYED AKBAR</i></span></a><a className="contact-home-link" href="/">BACK TO PORTFOLIO <ArrowRight size={15}/></a></header>
    <main className="contact-page-main resume-page-main"><div className="contact-page-intro"><span className="section-kicker">EDUCATION · EXPERIENCE · SKILLS <span>✳</span></span><h1>Resume <em>& CV.</em></h1><p>A concise overview of my education, experience, and skills.</p></div>
      {!available && <div className="resume-missing-banner"><FileText size={19}/><span>The CV PDF is not in the repository yet. Add it at <code>public/resume.pdf</code> to enable download and document preview.</span></div>}
      <article className="resume-document">
        <header className="resume-document-header"><div><h2>{portfolio.name}</h2><p>{portfolio.role} · {portfolio.location}</p></div><div><a href={`mailto:${portfolio.email}`}>{portfolio.email}</a><a href={portfolio.linkedin} target="_blank" rel="noreferrer">LinkedIn profile</a></div></header>
        <section><h3>Professional summary</h3><p>{portfolio.about}</p></section>
        <section><h3>Education</h3><div className="resume-timeline"><strong>{portfolio.education.program}</strong><span>{portfolio.education.institution}</span><span>Expected graduation: {portfolio.education.graduation}</span><small>Specialization and study dates: add confirmed details.</small><strong>High School Diploma</strong><span>Delhi Public School · Graduated 2025</span></div></section>
        <section><h3>Experience & volunteering</h3><p className="resume-placeholder">Add verified employment, internship, or volunteer roles in reverse chronological order. No experience details were provided for this portfolio.</p></section>
        <section><h3>Activities & achievements</h3><div className="resume-timeline"><strong>Delegate · DPS Model United Nations</strong><span>2024</span><span>Researched and debated international policy positions, collaborated with delegations, and helped draft resolutions.</span></div></section>
        <section><h3>Skills</h3><div className="resume-skill-list">{portfolio.skills.map(([title,tags])=><div key={title as string}><strong>{title as string}</strong><span>{(tags as string[]).join(' · ')}</span></div>)}</div></section>
        <section><h3>Certifications</h3><ul className="resume-cert-list"><li>Agile Project Management</li><li>Effective Leadership</li><li>Business Communications</li><li>Customer Relationship Management (CRM)</li><li>Success Mindset & Professional Development</li><li>Sales Forecasting</li><li>Python Programming Advanced Level</li></ul><a className="resume-cert-link" href="/#certificates">View certificate scans on the portfolio</a></section>
        {available && <a className="button button-fill resume-pdf-button" href="/resume.pdf" download="Haadhiya-Syed-Akbar-CV.pdf">DOWNLOAD FORMATTED CV <Download size={15}/></a>}
      </article>
      {available && <><h2 className="pdf-preview-title">PDF preview</h2><iframe className="resume-preview resume-page-preview" title="Haadhiya Syed Akbar CV PDF preview" src="/resume.pdf"/></>}
    </main><footer className="contact-page-footer"><a href="/">← BACK TO PORTFOLIO</a><span>© 2026 HAADHIYA SYED AKBAR</span></footer></div>
}

function VideoSection() {
  const available = usePublicFile('/video-presentation.mp4', 'video/')
  return <section className="section video-section" id="video"><div className="section-kicker">05 / MY STORY IN MOTION <span>✳</span></div><div className="section-heading"><div><h2 data-flight-target="video">A little more<br/><em>about my journey.</em></h2></div><p>A short introduction to my studies,<br/>what motivates me, and what I’m learning.</p></div>
    {available ? <video className="presentation-video" controls preload="metadata"><source src="/video-presentation.mp4" type="video/mp4"/>Your browser does not support video playback.</video> : <div className="missing-media-card"><span className="missing-media-play">▶</span><div><strong>Video presentation coming soon</strong><p>Add your 3–5 minute MP4 at <code>public/video-presentation.mp4</code>. Answer: introduce yourself; why UDST; your current program; why you chose it and what interests you; a course challenge and how you overcame it; and the HR trend that interests you most.</p></div></div>}
  </section>
}

function ProjectCard({ project }: { project: (typeof portfolio.projects)[number] }) {
  const isPresentation = 'format' in project && project.format === 'pptx'
  const fileType = isPresentation ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation' : 'application/pdf'
  const previewDocument = 'preview' in project ? project.preview ?? project.document : project.document
  const available = usePublicFile(project.document, fileType)
  const previewAvailable = usePublicFile(previewDocument, isPresentation ? 'application/pdf' : fileType)
  return <article className="academic-project-card">
    <div className="academic-project-top"><span className="project-number">{project.number}</span><span className="micro-label">{project.course}</span></div>
    <h3>{project.title}</h3>
    {project.summary ? <p className="project-summary">{project.summary}</p> : <p className="project-placeholder">Add a 50–100 word summary for this completed UDST project.</p>}
    <div className="academic-project-details"><p><b>KEY TAKEAWAYS</b>{project.takeaways || 'Add your confirmed takeaways.'}</p><p><b>SKILLS GAINED</b>{project.skills || 'Add skills you developed.'}</p><p><b>CHALLENGE</b>{project.challenge || 'Describe a real challenge and how you addressed it.'}</p><p><b>DEVELOPMENT</b>{project.development || 'Explain how the project supported your academic or professional growth.'}</p></div>
    {available ? <div className="project-document"><a href={project.document} download>{isPresentation ? 'DOWNLOAD POWERPOINT PRESENTATION' : 'DOWNLOAD FINAL PROJECT DOCUMENT'} <Download size={14}/></a>{previewAvailable ? <iframe src={previewDocument} title={`${project.title} document preview`}/> : isPresentation ? <p className="project-preview-note">For an inline preview, also add a PDF export at <code>public{previewDocument}</code>. Visitors can download the PowerPoint above.</p> : <iframe src={project.document} title={`${project.title} final document`}/>}</div> : <p className="project-document-missing"><FileText size={16}/> Add the final {isPresentation ? 'PowerPoint' : 'project PDF'} at <code>public{project.document}</code>.</p>}
  </article>
}

function ContactPage() {
  return <div className="contact-page">
    <header className="contact-page-header">
      <a className="brand" href="/"><span className="brand-mark"><Plane size={17}/></span><span>HAADHIYA <i>SYED AKBAR</i></span></a>
      <a className="contact-home-link" href="/">BACK TO PORTFOLIO <ArrowRight size={15}/></a>
    </header>
    <main className="contact-page-main">
      <div className="contact-page-intro">
        <span className="section-kicker">A NEW JOURNEY STARTS HERE <span>✳</span></span>
        <h1>Let’s <em>connect.</em></h1>
        <p>I’m open to internship opportunities and conversations with people shaping the future of aviation. I’d love to hear from you.</p>
      </div>
      <div className="contact-page-grid">
        <section className="contact-info-card" aria-labelledby="contact-details-title">
          <span className="micro-label">SAY HELLO</span>
          <h2 id="contact-details-title">Contact details</h2>
          <a className="contact-method" href={`mailto:${portfolio.email}`}><span className="contact-method-icon"><Mail size={19}/></span><span><small>EMAIL</small><strong>{portfolio.email}</strong></span><ArrowUpRight size={17}/></a>
          <a className="contact-method" href={portfolio.linkedin} target="_blank" rel="noreferrer"><span className="contact-method-icon contact-linkedin-mark">in</span><span><small>LINKEDIN</small><strong>Connect with Haadhiya</strong></span><ArrowUpRight size={17}/></a>
          <div className="contact-location"><span>⌖</span> QATAR · OPEN TO OPPORTUNITIES</div>
        </section>
        <section className="resume-card contact-resume-prompt" aria-labelledby="resume-title">
          <div className="resume-card-heading"><span className="resume-icon"><FileText size={20}/></span><div><span className="micro-label">EXPERIENCE & EDUCATION</span><h2 id="resume-title">View my resume</h2></div></div>
          <p>See my education, skills, and experience in one place.</p><a className="button button-fill" href="/resume">OPEN RESUME & CV <ArrowUpRight size={15}/></a>
        </section>
      </div>
    </main>
    <footer className="contact-page-footer"><a href="/">← BACK TO PORTFOLIO</a><span>© 2026 HAADHIYA SYED AKBAR</span></footer>
  </div>
}

function PortfolioPage() {
  const [scrolled,setScrolled]=useState(false), [open,setOpen]=useState(false)
  useEffect(()=>{const f=()=>setScrolled(scrollY>24);addEventListener('scroll',f,{passive:true});return()=>removeEventListener('scroll',f)},[])
  const go=(id:string)=>{document.getElementById(id.toLowerCase())?.scrollIntoView({behavior:'smooth'});setOpen(false)}
  return <>
    <AircraftFlight />
    <PinkCursor />
    <header className={`topbar ${scrolled?'is-scrolled':''}`}><a className="brand" href="#home" onClick={()=>go('Home')}><span className="brand-mark"><Plane size={17}/></span><span>HAADHIYA <i>SYED AKBAR</i></span></a><button className="menu-toggle" aria-label={open?'Close navigation':'Open navigation'} onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button><nav className={open?'nav-open':''}>{nav.map((item,i)=><a key={item} className={i===0?'nav-current':''} href={item==='Resume'?'/resume':`#${item.toLowerCase()}`} onClick={item==='Resume'?undefined:()=>go(item)}>{item}</a>)}<a className="nav-cta" href="/contact">LET’S CONNECT <ArrowUpRight size={14}/></a></nav></header>
    <main>
      <section className="hero" id="home"><div className="hero-sky"><div className="sun-halo"/><div className="cloud cloud-a"/><div className="cloud cloud-b"/><div className="cloud cloud-c"/><div className="runway-lines"/></div><div className="hero-copy"><div className="eyebrow"><span/> AVIATION MANAGEMENT · QATAR</div><h1 data-flight-target="home">Haadhiya<br/><span>Syed Akbar</span></h1><div className="hero-role">Aviation Management Student <i/></div><p>{portfolio.intro}</p><div className="hero-meta"><span><b>⌖</b> Based in Qatar</span><span><b>✳</b> Seeking Internship Opportunities</span></div><div className="hero-actions"><a className="button button-fill" href="#about" onClick={()=>go('About')}>EXPLORE MY JOURNEY <ArrowDownRight size={16}/></a><a className="button button-outline" href={`mailto:${portfolio.email}`}>CONTACT ME <ArrowUpRight size={16}/></a></div><div className="hero-index"><span>01</span> — 07 <i>SCROLL TO EXPLORE</i></div></div><div className="hero-portrait"><Portrait/><div className="portrait-caption"><span>THE WORLD, IN MOTION</span><small>QATAR · AVIATION</small></div></div><div className="hero-note"><i>✳</i><span>Curiosity<br/>takes flight.</span></div><a className="scroll-cue" href="#about" onClick={()=>go('About')}><span>SCROLL TO DISCOVER</span><ArrowDown size={14}/></a></section>
      <div className="marquee"><div>PASSION FOR FLIGHT <i>✳</i> BUILT ON CURIOSITY <i>✳</i> READY FOR TAKEOFF <i>✳</i> PASSION FOR FLIGHT <i>✳</i> BUILT ON CURIOSITY <i>✳</i></div></div>
      <section className="section about-section" id="about"><div className="section-kicker">01 / A LITTLE ABOUT ME <span>✳</span></div><div className="about-grid"><div className="about-portrait-wrap"><Portrait/><div className="orbit orbit-one"/><div className="orbit orbit-two"/><span className="floating-label">MEET YOUR<br/>FUTURE COLLEAGUE</span></div><div className="about-copy"><h2 className="serif-quote" data-flight-target="about">Every journey begins<br/>with a <em>why.</em></h2><p>{portfolio.about}</p><p className="about-secondary">I’m keen to learn from industry professionals, contribute with care, and grow into a thoughtful aviation professional.</p><a className="text-link" href="#contact" onClick={()=>go('Contact')}>A LITTLE MORE ABOUT ME <ArrowRight size={15}/></a><div className="about-stamp"><Compass/><span>ALWAYS<br/>LOOKING UP</span></div></div></div><div className="profile-facts"><article><span className="micro-label">ACCOMPLISHMENT</span><p>Delegate, DPS Model United Nations (2024).</p></article><article><span className="micro-label">VOLUNTEERING</span><p>No volunteer roles are listed in the provided CV. Add confirmed experience if applicable.</p></article><article><span className="micro-label">HOBBIES & INTERESTS</span><p>Add personal hobbies; aviation interests are described in the section below.</p></article><article><span className="micro-label">CERTIFICATIONS</span><p>Agile Project Management · Effective Leadership · Business Communications · Customer Relationship Management · Success Mindset & Professional Development. View certificate scans below.</p></article></div><CertificateGallery/></section>
      <section className="section education-section" id="education"><div className="section-kicker">02 / WHERE I’M LEARNING <span>✳</span></div><div className="section-heading"><div><h2 data-flight-target="education">Grounded in learning.<br/><em>Going places.</em></h2></div><p>A foundation in aviation management,<br/>with plenty of runway ahead.</p></div><div className="education-card"><div className="education-icon"><GraduationCap/></div><div className="education-main"><span className="micro-label">CURRENT STUDIES</span><h3>{portfolio.education.program}</h3><p>{portfolio.education.institution}</p><div className="edu-tags"><span>{portfolio.education.specialization}</span><span>{portfolio.education.period}</span></div></div><div className="education-side"><span>EXPECTED GRADUATION</span><strong>{portfolio.education.graduation}</strong><i>Education details are editable placeholders.</i></div><div className="education-route"><span>✳</span><i/></div></div></section>
      <section className="section interests-section" id="interests"><div className="section-kicker">03 / WHAT TAKES MY CURIOSITY <span>✳</span></div><div className="section-heading"><div><h2 data-flight-target="interests">Six skies.<br/><em>Endless questions.</em></h2></div><p>The parts of aviation I can’t stop<br/>wondering about.</p></div><div className="interest-grid">{portfolio.interests.map(([n,title,desc],i)=><article key={n} className="interest-card"><div className="interest-top"><span>{n}</span>{interestIcons[i]}</div><h3>{title}</h3><p>{desc}</p><ArrowUpRight className="interest-arrow" size={16}/></article>)}</div></section>
      <section className="section projects-section" id="projects"><div className="section-kicker">04 / ACADEMIC PROJECTS <span>✳</span></div><div className="section-heading"><div><h2 data-flight-target="projects">Learning,<br/><em>put into practice.</em></h2></div><p>Two project spaces ready for completed<br/>UDST coursework and final documents.</p></div><div className="academic-project-list">{portfolio.projects.map(project=><ProjectCard key={project.number} project={project}/>)}</div><p className="project-note"><i>✳</i> Replace marked placeholders with verified course projects, codes, summaries, reflections, and submitted PDFs.</p></section>
      <VideoSection />
      <section className="section skills-section" id="skills"><div className="section-kicker">06 / THINGS I BRING <span>✳</span></div><div className="section-heading"><div><h2 data-flight-target="skills">Good foundations.<br/><em>Room to grow.</em></h2></div><p>Skills I’m building through study,<br/>curiosity, and collaboration.</p></div><div className="skills-grid">{portfolio.skills.map(([title,tags],i)=><article className="skill-card" key={title as string}><div className="skill-index">0{i+1} <i>✳</i></div><h3>{title as string}</h3><div className="skill-tags">{(tags as string[]).map(t=><span key={t}>{t}</span>)}</div></article>)}</div></section>
      <section className="contact-section" id="contact"><div className="contact-sky"><div className="contact-sun"/></div><div className="section-kicker">07 / YOURS, IN THE CLOUDS <span>✳</span></div><div className="contact-content"><span className="contact-sup">THE NEXT CHAPTER STARTS WITH A CONVERSATION</span><h2 data-flight-target="contact">Let’s make<br/>something <em>take off.</em></h2><p>I’m open to internship opportunities and conversations with people shaping the future of aviation.</p><a className="button button-light" href={`mailto:${portfolio.email}`}>START A CONVERSATION <ArrowUpRight size={16}/></a><div className="contact-details"><a href={`mailto:${portfolio.email}`}>{portfolio.email}</a><a href={portfolio.linkedin} target="_blank" rel="noreferrer">LINKEDIN <ArrowUpRight size={13}/></a><span>QATAR · OPEN TO OPPORTUNITIES</span></div></div><div className="contact-plane"><Plane size={19}/><i/></div><div className="contact-watermark">✳</div></section>
    </main>
    <footer className="footer"><div className="footer-main"><a className="brand footer-brand" href="#home" onClick={()=>go('Home')}><span className="brand-mark"><Plane size={17}/></span><span>HAADHIYA <i>SYED AKBAR</i></span></a><div className="footer-dream">Dream beyond<br/>the <em>clouds.</em> <span>✳</span></div><div className="footer-links"><span>QUICK LINKS</span><div>{nav.slice(1).map(item=><a key={item} href={item==='Resume'?'/resume':`#${item.toLowerCase()}`} onClick={item==='Resume'?undefined:()=>go(item)}>{item}</a>)}</div></div><div className="footer-social"><span>LET’S CONNECT</span><a href={`mailto:${portfolio.email}`}>EMAIL <ArrowUpRight size={13}/></a><a href={portfolio.linkedin} target="_blank" rel="noreferrer">LINKEDIN <ArrowUpRight size={13}/></a></div></div><div className="footer-bottom"><span>© 2026 HAADHIYA SYED AKBAR</span><span>MADE WITH CURIOSITY <i>✳</i></span><a href="#home" onClick={()=>go('Home')}>BACK TO TOP ↑</a></div><div className="footer-plane"><Plane size={14}/></div></footer>
  </>
}

export default function App() {
  const path = window.location.pathname.replace(/\/$/, '')
  if (path === '/contact') return <ContactPage />
  if (path === '/resume') return <ResumePage />
  return <PortfolioPage />
}
