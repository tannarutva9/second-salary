import html2canvas from 'html2canvas';
import React, { useState, useEffect } from 'react';
import './index.css';

export default function App() {
  // Logic will be ported manually
  useEffect(() => {
    try {
      
        // ── Navigation ──────────────────────────────────────────
        const screens = { 
          onboarding: 'screen-onboarding',
          home: 'screen-home', 
          plan: 'screen-plan', 
          copilot: 'screen-copilot',
          cohort: 'screen-cohort',
          specs: 'screen-specs',
          caps: 'screen-caps', 
          metrics: 'screen-metrics', 
          journey: 'screen-journey',
          channels: 'screen-channels'
        };
        const navIds  = { 
          home: 'nav-home', 
          plan: 'nav-plan', 
          copilot: 'nav-copilot',
          cohort: 'nav-cohort',
          specs: 'nav-specs'
        };
      
        function navigate(key) {
          Object.values(screens).forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.remove('active');
          });
          Object.values(navIds).forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.remove('active');
          });
          
          // Progressive Onboarding UI State Gate: Hide Bottom Nav during Onboarding
          const nav = document.querySelector('.bottom-nav');
          const fab = document.getElementById('screenshot-fab');
          if (key === 'onboarding') {
            if (nav) nav.style.display = 'none';
            if (fab) fab.style.display = 'none';
          } else {
            if (nav) nav.style.display = 'flex';
            if (fab) fab.style.display = 'flex';
          }
      
          const target = document.getElementById(screens[key]);
          if (target) { target.classList.add('active'); target.scrollTop = 0; window.scrollTo(0,0); }
          if (navIds[key]) document.getElementById(navIds[key]).classList.add('active');
        }
      
        // ── Modals ───────────────────────────────────────────────
        function openLogModal()    { document.getElementById('log-modal').classList.add('open'); }
        function openCrisisModal() { document.getElementById('crisis-modal').classList.add('open'); }
        function closeModal(id)    { document.getElementById(id).classList.remove('open'); }
        function handleModalClick(e, id) {
          if (e.target === document.getElementById(id)) closeModal(id);
        }
      
        // ── Log Earnings ─────────────────────────────────────────
        function logEarnings() {
          const amt = document.getElementById('earn-amount').value;
          if (!amt) { showToast('Enter an amount first'); return; }
          closeModal('log-modal');
          document.getElementById('celebrate-amount').textContent = '₹' + parseInt(amt).toLocaleString('en-IN');
          document.getElementById('celebrate').classList.add('open');
          // Update hero
          document.getElementById('hero-pct').textContent = '84%';
          document.getElementById('hero-ring').setAttribute('stroke-dashoffset', '30');
          document.getElementById('earn-amount').value = '';
        }
        function closeCelebrate() {
          document.getElementById('celebrate').classList.remove('open');
          showToast('🌟 Earnings logged successfully');
        }
      
        // ── Crisis Script ─────────────────────────────────────────
        function generateCrisisScript() {
          const type = document.getElementById('crisis-type').value;
          if (!type) { showToast('Select a situation type first'); return; }
          closeModal('crisis-modal');
          showToast('📋 3-message script copied to clipboard');
        }
      
        // ── Toast ────────────────────────────────────────────────
        let toastTimer;
        function showToast(msg) {
          const t = document.getElementById('toast');
          t.textContent = msg;
          t.classList.add('show');
          clearTimeout(toastTimer);
          toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
        }
      
        // ── Confidence Slider ────────────────────────────────────
        function updateConf(v) {
          document.getElementById('conf-display').textContent = v;
          const pct = ((v - 1) / 9) * 100;
          document.getElementById('conf-slider').style.background =
            `linear-gradient(to right, var(--orange) 0%, var(--orange) ${pct}%, var(--border) ${pct}%, var(--border) 100%)`;
          showToast(`Confidence updated to ${v}/10`);
        }
      
        // ── Day Detail Toggle ────────────────────────────────────
        function toggleDayDetail(card) {
          const detail = card.querySelector('.day-detail');
          const arrow  = card.querySelector('.expand-arrow');
          if (!detail) return;
          const open = detail.style.display !== 'none' && detail.style.display !== '';
          detail.style.display = open ? 'none' : 'block';
          if (arrow) arrow.textContent = open ? '›' : '˅';
        }
      
        // ── Journey Tabs ─────────────────────────────────────────
        function switchJourney(tab, panelId) {
          document.querySelectorAll('.journey-tab').forEach(t => t.classList.remove('active'));
          document.querySelectorAll('.journey-panel').forEach(p => p.classList.remove('active'));
          tab.classList.add('active');
          document.getElementById(panelId).classList.add('active');
        }
      
        // ── Animate ring on load ─────────────────────────────────
        window.addEventListener('load', () => {
          setTimeout(() => {
            const ring = document.getElementById('hero-ring');
            if (ring) ring.style.strokeDashoffset = '56.5';
          }, 300);
        });
      
        // ── Caps: navigate from home section-label ───────────────
        // The "See all" link on Day Plan section navigates to caps
        document.querySelectorAll('.section-label a').forEach(a => {
          if (a.textContent.includes('All 8')) {
            a.onclick = () => navigate('caps');
          }
        });
      
        // ── Query Parameters Navigation ──────────────────────────
        window.addEventListener('load', () => {
          const params = new URLSearchParams(window.location.search);
          const screenParam = params.get('screen');
          if (screenParam && screens[screenParam]) {
            navigate(screenParam);
          }
        });
      
        // ── Pixel-Perfect Screenshots Capture ────────────────────
        function captureScreen() {
          if (typeof html2canvas === 'undefined') {
            showToast('⚠️ Screenshot helper loading. Connect to internet or use Win+Shift+S.');
            return;
          }
          
          const fab = document.getElementById('screenshot-fab');
          const nav = document.querySelector('.bottom-nav');
          
          if (fab) fab.style.display = 'none';
          
          // Temporarily switch fixed navigation element to absolute relative to .app-shell
          // so html2canvas renders it perfectly at the bottom of the capture canvas
          const originalNavStyle = nav.style.cssText;
          nav.style.position = 'absolute';
          nav.style.bottom = '0';
          nav.style.left = '0';
          nav.style.transform = 'none';
          nav.style.width = '100%';
          
          showToast('📸 Capturing pixel-perfect screen...');
          
          setTimeout(() => {
            html2canvas(document.querySelector('.app-shell'), {
              scale: 3, // Super high-res, ultra-crisp
              useCORS: true,
              allowTaint: true,
              backgroundColor: '#F7F8FA',
              scrollX: 0,
              scrollY: 0,
              windowWidth: 430,
              windowHeight: document.querySelector('.app-shell').offsetHeight
            }).then(canvas => {
              const link = document.createElement('a');
              const activeScreen = Object.keys(screens).find(key => 
                document.getElementById(screens[key]).classList.contains('active')
              ) || 'screen';
              
              link.download = `second_salary_${activeScreen}.png`;
              link.href = canvas.toDataURL('image/png');
              link.click();
              
              // Restore elements
              if (fab) fab.style.display = 'flex';
              nav.style.cssText = originalNavStyle;
              showToast('✓ High-res screenshot downloaded!');
            }).catch(err => {
              console.error(err);
              if (fab) fab.style.display = 'flex';
              nav.style.cssText = originalNavStyle;
              showToast('❌ Capture failed. Try standard screen capture.');
            });
          }, 500);
        }
      
        // ── ONBOARDING WIZARD SIMULATOR ────────────────────────────
        let onboardCurrentStep = 1;
        let selectedSkill = "";
        let selectedFailureMode = "";
        let profile = {
          completed: false,
          skill: "",
          failureMode: "",
          hours: 6,
          target: 50000
        };
      
        const skillsTaxonomy = [
          "Product UI Design", "Mobile App UX", "Fintech Consultant",
          "Figma Prototyping", "UX Copywriting", "Webflow Developer",
          "React Frontend Dev", "SaaS Growth Marketer", "SEO Copywriting",
          "API Integration Expert", "Technical Writer", "E-commerce Dev"
        ];
      
        function populateSkills() {
          const container = document.getElementById('onboard-skills-container');
          if (!container) return;
          container.innerHTML = "";
          skillsTaxonomy.forEach(skill => {
            const pill = document.createElement('div');
            pill.className = 'skill-pill';
            pill.textContent = skill;
            pill.onclick = () => selectSkillPill(pill, skill);
            container.appendChild(pill);
          });
        }
      
        function selectSkillPill(pill, skill) {
          document.querySelectorAll('.skill-pill').forEach(p => p.classList.remove('selected'));
          pill.classList.add('selected');
          selectedSkill = skill;
          showToast(`Skill selected: ${skill}`);
        }
      
        function selectFailure(card, mode) {
          document.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          selectedFailureMode = mode;
          showToast(`Failure mode locked: ${mode.toUpperCase()}`);
        }
      
        function updateOnboardProgressBar() {
          const fill = document.getElementById('onboard-progress');
          const pct = (onboardCurrentStep / 3) * 100;
          if (fill) fill.style.width = pct + '%';
        }
      
        function nextOnboardStep() {
          if (onboardCurrentStep === 1) {
            if (!selectedSkill) {
              showToast('⚠️ Please select a primary skill first.');
              return;
            }
            onboardCurrentStep = 2;
            document.getElementById('onboard-step-1').classList.remove('active');
            document.getElementById('onboard-step-2').classList.add('active');
            document.getElementById('onboard-back-btn').style.display = 'block';
          } else if (onboardCurrentStep === 2) {
            if (!selectedFailureMode) {
              showToast('⚠️ Please select your previous failure mode.');
              return;
            }
            onboardCurrentStep = 3;
            document.getElementById('onboard-step-2').classList.remove('active');
            document.getElementById('onboard-step-3').classList.add('active');
            document.getElementById('onboard-next-btn').textContent = 'Generate Profile 🚀';
          } else if (onboardCurrentStep === 3) {
            // Compile & lock profile
            profile.completed = true;
            profile.skill = selectedSkill;
            profile.failureMode = selectedFailureMode;
            profile.hours = parseInt(document.getElementById('onboard-hours-slider').value);
            profile.target = parseInt(document.getElementById('onboard-target-slider').value);
            
            // Save to localStorage for persistence
            localStorage.setItem('second_salary_profile', JSON.stringify(profile));
            
            showToast('🌟 Creating your personalized infrastructure...');
            
            setTimeout(() => {
              syncProfileToUI();
              navigate('home');
            }, 1000);
          }
          updateOnboardProgressBar();
        }
      
        function prevOnboardStep() {
          if (onboardCurrentStep === 2) {
            onboardCurrentStep = 1;
            document.getElementById('onboard-step-2').classList.remove('active');
            document.getElementById('onboard-step-1').classList.add('active');
            document.getElementById('onboard-back-btn').style.display = 'none';
          } else if (onboardCurrentStep === 3) {
            onboardCurrentStep = 2;
            document.getElementById('onboard-step-3').classList.remove('active');
            document.getElementById('onboard-step-2').classList.add('active');
            document.getElementById('onboard-next-btn').textContent = 'Continue';
          }
          updateOnboardProgressBar();
        }
      
        // ── STATE SYNCHRONIZATION (Profile ➔ UI) ────────────────────
        function syncProfileToUI() {
          const raw = localStorage.getItem('second_salary_profile');
          if (!raw) return;
          profile = JSON.parse(raw);
      
          // 1. Update Greeting and Dashboard Info
          const greeting = document.querySelector('.top-header .greeting');
          if (greeting) greeting.textContent = `Good evening, ${profile.skill} 👋`;
          
          const targetLabel = document.querySelector('.stat-row .stat-pill:last-child .stat-val');
          if (targetLabel) targetLabel.textContent = `₹${(profile.target / 1000).toFixed(0)}K`;
      
          // 2. Pricing Calculator default values sync
          const calcIncome = document.getElementById('calc-income');
          const calcHours = document.getElementById('calc-hours');
          if (calcIncome) calcIncome.value = profile.target;
          if (calcHours) calcHours.value = profile.hours;
          updatePricingCalc();
      
          // 3. Dynamic Plan Adaptation based on Failure Mode
          const dayDetail1 = document.querySelector('.cap-list .day-card:nth-child(1) .day-detail p');
          const dayDetail2 = document.querySelector('.cap-list .day-card:nth-child(2) .day-detail p');
          const dayDetail4 = document.querySelector('.cap-list .day-card:nth-child(4) .day-detail p');
      
          if (profile.failureMode === 'ghosted') {
            if (dayDetail1) dayDetail1.innerHTML = `<strong>Script provided:</strong> "Freelance ${profile.skill} open to consulting. Strict 50% upfront payment term for all new project scopes."`;
            if (dayDetail4) dayDetail4.innerHTML = `<strong>Script:</strong> "Hi [Name], I specialize in ${profile.skill}. I noticed [Company] is building [feature]. I have pre-designed escrow templates ready to secure the contract and protect deliverables. Let's talk?"`;
          } else if (profile.failureMode === 'scope') {
            if (dayDetail2) dayDetail2.innerHTML = `<strong>Template:</strong> "Here is how I outline strict revisions limits on projects so that scope creep never stalls a launch..."`;
            if (dayDetail4) dayDetail4.innerHTML = `<strong>Script:</strong> "I limit all design milestones to 2 strict iteration cycles. This ensures your project ships 3 weeks faster than traditional consultancies."`;
          } else if (profile.failureMode === 'underpriced') {
            if (dayDetail1) dayDetail1.innerHTML = `<strong>Script provided:</strong> "I quote direct project rates with a built-in 1.5x value-buffer so scope changes are handled without price renegotiations."`;
          }
      
          // 4. Upwork Channel Guardrails Sync based on skill
          const upworkTitle = document.getElementById('upwork-title-text');
          const upworkDesc = document.getElementById('upwork-desc-text');
          const upworkGuide = document.getElementById('upwork-guide-text');
          
          if (profile.skill.includes('Design') || profile.skill.includes('Figma')) {
            if (upworkTitle) upworkTitle.textContent = "Upwork Design Shield";
            if (upworkDesc) upworkDesc.textContent = `Optimized for ${profile.skill} proposals. Blocks clients offering under ₹1,500/hour.`;
            if (upworkGuide) upworkGuide.innerHTML = `<strong>Safety-Wrap Guardrail:</strong> Never start work without a funded Escrow milestone. Figma edit access remains locked until milestone is approved.`;
          } else {
            if (upworkTitle) upworkTitle.textContent = "Upwork Service Shield";
            if (upworkDesc) upworkDesc.textContent = `Optimized for ${profile.skill} packages. Filters out clients without verified payment methods.`;
          }
      
          // 5. Cohort prompt sync
          const challengeText = document.getElementById('cohort-challenge-text');
          if (challengeText) {
            challengeText.innerHTML = `Day 9 Target: Draft your **${profile.skill}** proposal. Because your last attempt failed due to **${profile.failureMode.toUpperCase()}**, the AI Co-Pilot has loaded custom protective guardrails into your drafts below!`;
          }
        }
      
        function resetProfileSimulation() {
          localStorage.removeItem('second_salary_profile');
          onboardCurrentStep = 1;
          selectedSkill = "";
          selectedFailureMode = "";
          
          // Clear styles
          document.querySelectorAll('.skill-pill').forEach(p => p.classList.remove('selected'));
          document.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
          
          // Reset wizard active step
          document.getElementById('onboard-step-2').classList.remove('active');
          document.getElementById('onboard-step-3').classList.remove('active');
          document.getElementById('onboard-step-1').classList.add('active');
          document.getElementById('onboard-back-btn').style.display = 'none';
          document.getElementById('onboard-next-btn').textContent = 'Continue';
          updateOnboardProgressBar();
          
          showToast('🔄 Profile reset successfully!');
          navigate('onboarding');
        }
      
        // ── AI CO-PILOT WORKSPACE LOGIC ────────────────────────────
        function switchCopilotTab(tabId) {
          document.querySelectorAll('.copilot-tab').forEach(t => t.classList.remove('active'));
          document.querySelectorAll('.copilot-panel').forEach(p => p.classList.remove('active'));
          
          document.getElementById(`tab-${tabId}`).classList.add('active');
          document.getElementById(`panel-${tabId}`).classList.add('active');
        }
      
        function generateProposal() {
          const client = document.getElementById('prop-client').value || "Fintech startup";
          const scope = document.getElementById('prop-scope').value || "5 mobile dashboard screens";
          const tone = document.getElementById('prop-tone').value;
          
          const outputWrap = document.getElementById('proposal-output-wrap');
          const outputText = document.getElementById('proposal-text');
          
          showToast('🤖 AI Co-Pilot drafting pitch...');
          
          let proposalBody = "";
          if (tone === 'collaborative') {
            proposalBody = `Hi ${client.split(',')[0]} Team,\n\nI noticed you are currently hiring for a ${profile.skill} to build out ${scope}.\n\nInstead of a standard agency engagement, I provide peer-to-peer consulting (max 6h/week) focused exclusively on shipping your core product. Given my background in ${profile.skill}, I have built specific protective guardrails so we avoid traditional blockers:\n\n1. Scope constraint: Custom delivery in defined Figma design sprints.\n2. Protected delivery: 50% upfront payment via safe escrow milestone, guaranteeing dedicated scheduling.\n\nWould a brief 15-minute alignment call be useful this Thursday?\n\nBest,\n[Your Name]`;
          } else {
            proposalBody = `Subject: ${profile.skill} Consulting Proposal — ${client.split(',')[0]}\n\nHello,\n\nI specialize in ${profile.skill} and would love to help you Redesign ${scope}.\n\nMy package targets immediate results with a defined scope of deliverables:\n- ${scope}\n- Custom Figma interactive components\n- 2 strict revision cycles included\n\nRate: ₹${(profile.target / 2).toLocaleString('en-IN')} (Fixed package price, 50% upfront, 50% on project delivery).\n\nLet's get this shipped.\n\nRegards,\n[Your Name]`;
          }
          
          setTimeout(() => {
            outputText.textContent = proposalBody;
            outputWrap.style.display = 'block';
            showToast('✓ Proposal Pitch generated!');
          }, 800);
        }
      
        function generateContract() {
          const fee = document.getElementById('contract-fee').value || "50000";
          const revisions = document.getElementById('contract-revisions').value;
          
          const outputWrap = document.getElementById('contract-output-wrap');
          const outputText = document.getElementById('contract-text');
          
          showToast('📝 Crafting protective clauses...');
          
          const formattedFee = parseInt(fee).toLocaleString('en-IN');
          const deposit = (parseInt(fee) * 0.5).toLocaleString('en-IN');
          
          const contractBody = `=== SECTION 1: SCOPE OF WORK ===\nThe Consultant will deliver exactly: Figma prototype files, final UI assets, and up to 2 design mockups. Any deliverables not listed are strictly out-of-scope.\n\n=== SECTION 2: PAYMENT SCHEDULE (PROTECTIVE) ===\n1. Initial Retainer Deposit: ₹${deposit} (50% of project total) paid upfront prior to work kickoff.\n2. Milestone 2 Completion: Final payment of ₹${deposit} (50%) due strictly upon delivery.\n\n=== SECTION 3: REVISIONS LIMIT ===\nThis project fee includes exactly ${revisions} cycle(s) of written revisions. Any revision cycles requested beyond this limit will be billed as a separate scope amendment at an hourly rate of ₹${Math.round(profile.target / (profile.hours * 4)).toLocaleString('en-IN')}/hour.\n\n=== SECTION 4: KILL-FEE PROTECTION ===\nIf the client terminates this agreement or goes silent for more than 14 consecutive business days, the initial 50% deposit remains 100% non-refundable, and a 30% kill fee on the remaining balance is instantly outstanding.`;
          
          setTimeout(() => {
            outputText.textContent = contractBody;
            outputWrap.style.display = 'block';
            showToast('✓ Protective contract generated!');
          }, 800);
        }
      
        function updatePricingCalc() {
          const targetIncome = parseInt(document.getElementById('calc-income').value);
          const weeklyHours = parseInt(document.getElementById('calc-hours').value);
          
          document.getElementById('calc-income-val').textContent = '₹' + targetIncome.toLocaleString('en-IN');
          document.getElementById('calc-hours-val').textContent = weeklyHours + ' hrs';
          
          // Core math: Target Income divided by 4 weeks, divided by hours/week
          const hourlyRate = Math.round(targetIncome / (weeklyHours * 4.3));
          const projectAnchor = Math.round(hourlyRate * weeklyHours * 1.5 * 4); // 1.5x value buffer
          
          document.getElementById('calc-res-hourly').textContent = '₹' + hourlyRate.toLocaleString('en-IN');
          document.getElementById('calc-res-retainer').textContent = '₹' + targetIncome.toLocaleString('en-IN');
          document.getElementById('calc-res-project').textContent = '₹' + projectAnchor.toLocaleString('en-IN');
        }
      
        function copyCopilotText(elementId) {
          const text = document.getElementById(elementId).textContent;
          navigator.clipboard.writeText(text);
          showToast('✓ Copied to clipboard!');
        }
      
        // ── ASYNC PEER COHORTS CHATBOARD LOGIC ───────────────────────
        function handleChatKeyPress(e) {
          if (e.key === 'Enter') {
            sendCohortMessage();
          }
        }
      
        function sendCohortMessage() {
          const input = document.getElementById('chat-input-field');
          const container = document.getElementById('chat-messages-container');
          
          if (!input || !input.value.trim()) return;
          
          const text = input.value.trim();
          input.value = "";
          
          // Render user message bubble
          const userBubble = document.createElement('div');
          userBubble.className = 'chat-bubble right';
          userBubble.innerHTML = `
            <div class="chat-avatar me">ME</div>
            <div class="chat-bubble-body">
              <div class="chat-user-name">You (${profile.skill})</div>
              <p class="chat-text">${text}</p>
              <div class="chat-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          `;
          container.appendChild(userBubble);
          container.scrollTop = container.scrollHeight;
          
          // Trigger simulated peer response with a slight delay
          showToast('💬 Sneha T. is typing...');
          setTimeout(() => {
            const peerBubble = document.createElement('div');
            peerBubble.className = 'chat-bubble left';
            peerBubble.innerHTML = `
              <div class="chat-avatar a3">ST</div>
              <div class="chat-bubble-body">
                <div class="chat-user-name">Sneha T.</div>
                <p class="chat-text">Love that perspective! That fits perfectly with our Day 9 goal. The protective scope contract is exactly what keeps clients in line.</p>
                <div class="chat-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            `;
            container.appendChild(peerBubble);
            container.scrollTop = container.scrollHeight;
            showToast('New message from cohort');
          }, 2000);
        }
      
        // ── ON LOAD INITIALIZATION ─────────────────────────────────
        window.addEventListener('load', () => {
          populateSkills();
          
          const raw = localStorage.getItem('second_salary_profile');
          if (raw) {
            // Profile exists, load dashboard home screen
            syncProfileToUI();
            navigate('home');
          } else {
            // Profile empty, launch onboarding wizard first
            navigate('onboarding');
          }
        });
      
    } catch(err) {
      console.error(err);
    }
  }, []);

  return (
    <>
      

<div className="app-shell">

  
  <div className="screen active" id="screen-onboarding" style={{padding: '0', background: 'var(--white)'}}>
    <div className="onboarding-screen">
      
      
      <div className="onboarding-header">
        <div style={{fontSize: '38px', marginBottom: '8px'}}>🌱</div>
        <h1>Second <span>Salary</span></h1>
        <p>From "burned and stalled" to your first ₹10,000 earned in 90 days. Let's build your protective infrastructure.</p>
      </div>

      
      <div className="onboarding-progress-bar">
        <div className="onboarding-progress-fill" id="onboard-progress"></div>
      </div>

      
      <div className="onboarding-step active" id="onboard-step-1">
        <h2 style={{fontSize: '17px', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '12px'}}>What is your primary skill or consulting area?</h2>
        <p style={{fontSize: '12px', color: 'var(--text-mid)', marginBottom: '16px', lineHeight: '1.4'}}>Select your domain. We will load a matching 40-skill taxonomy for you.</p>
        
        <div className="skills-grid" id="onboard-skills-container">
          
        </div>
      </div>

      
      <div className="onboarding-step" id="onboard-step-2">
        <h2 style={{fontSize: '17px', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '12px'}}>What happened in your last side income attempt?</h2>
        <p style={{fontSize: '12px', color: 'var(--text-mid)', marginBottom: '16px', lineHeight: '1.4'}}>We replace the exact infrastructure that was missing last time. Be brutally honest.</p>
        
        <div className="option-cards">
          <div className="option-card" onclick="selectFailure(this, 'ghosted')">
            <span className="opt-icon">🚨</span>
            <div>
              <h3>Client went quiet / ghosted me</h3>
              <p>Work was delivered, but outstanding invoices were never paid.</p>
            </div>
          </div>
          <div className="option-card" onclick="selectFailure(this, 'scope')">
            <span className="opt-icon">📈</span>
            <div>
              <h3>Unlimited scope creep</h3>
              <p>The client kept demanding "small additions" without paying more.</p>
            </div>
          </div>
          <div className="option-card" onclick="selectFailure(this, 'underpriced')">
            <span className="opt-icon">💸</span>
            <div>
              <h3>Massive underpricing</h3>
              <p>I quoted too low, worked 40 hours for peanuts, and burned out.</p>
            </div>
          </div>
          <div className="option-card" onclick="selectFailure(this, 'paralysis')">
            <span className="opt-icon">🌀</span>
            <div>
              <h3>Analysis paralysis / Stalled</h3>
              <p>I couldn't figure out packaging, pricing, or DMs, and never started.</p>
            </div>
          </div>
        </div>
      </div>

      
      <div className="onboarding-step" id="onboard-step-3">
        <h2 style={{fontSize: '17px', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '12px'}}>Your commitment & earning targets</h2>
        <p style={{fontSize: '12px', color: 'var(--text-mid)', marginBottom: '20px', lineHeight: '1.4'}}>Let's customize your adaptive Day-9 sprint and recommended pricing rates.</p>
        
        <div className="calc-box">
          <div className="calc-row">
            <span className="calc-label">Hours available per week</span>
            <span className="calc-value" id="onboard-hours-val">6 hrs</span>
          </div>
          <div className="calc-slider-wrap">
            <input type="range" className="conf-slider" id="onboard-hours-slider" min="4" max="20" value="6" oninput="document.getElementById('onboard-hours-val').textContent = this.value + ' hrs'" />
          </div>

          <div className="calc-row" style={{marginTop: '24px'}}>
            <span className="calc-label">Target side income (90 days)</span>
            <span className="calc-value" id="onboard-target-val">₹50,000</span>
          </div>
          <div className="calc-slider-wrap">
            <input type="range" className="conf-slider" id="onboard-target-slider" min="10000" max="150000" step="5000" value="50000" oninput="document.getElementById('onboard-target-val').textContent = '₹' + parseInt(this.value).toLocaleString('en-IN')" />
          </div>
        </div>
      </div>

      
      <div className="onboarding-btn-row">
        <button className="btn-secondary" id="onboard-back-btn" onclick="prevOnboardStep()" style={{display: 'none'}}>Back</button>
        <button className="modal-btn" id="onboard-next-btn" onclick="nextOnboardStep()" style={{marginTop: '0', flex: '2'}}>Continue</button>
      </div>

    </div>
  </div>

  
  <div className="screen" id="screen-home">

    <div className="top-header">
      <p className="greeting">Good evening, Priya 👋</p>
      <h1>Let's keep<br /><span>earning more</span></h1>
      <div className="avatar">P</div>
    </div>

    
    <div className="hero-card">
      <div className="hero-text">
        <p>Total ₹ Earned</p>
        <div className="hero-amount"><span>₹</span>42,000</div>
        <button className="hero-btn" onclick="openLogModal()">+ Log Earnings</button>
      </div>
      <div className="circular-progress">
        <svg viewBox="0 0 72 72" width="72" height="72">
          <circle className="ring-bg" cx="36" cy="36" r="30"/>
          <circle className="ring-fill" cx="36" cy="36" r="30"
            stroke-dasharray="188.5"
            stroke-dashoffset="56.5"
            id="hero-ring"/>
        </svg>
        <span className="pct" id="hero-pct">70%</span>
      </div>
    </div>

    
    <div className="section-label"><h2>Your Progress</h2><span></span></div>
    <div className="stat-row">
      <div className="stat-pill">
        <div className="stat-val orange">Day 28</div>
        <div className="stat-label">Since signup</div>
      </div>
      <div className="stat-pill">
        <div className="stat-val teal">Day 9 ✓</div>
        <div className="stat-label">Milestone hit</div>
      </div>
      <div className="stat-pill">
        <div className="stat-val green">3</div>
        <div className="stat-label">Proposals sent</div>
      </div>
      <div className="stat-pill">
        <div className="stat-val orange">₹50K</div>
        <div className="stat-label">Target</div>
      </div>
    </div>

    
    <div className="section-label"><h2>Next Action</h2><span></span></div>
    <div className="next-action">
      <div className="action-icon">📤</div>
      <div className="action-body">
        <h4>Send follow-up to Client 2</h4>
        <p>Your Day-14 script is ready · ~15 min</p>
      </div>
      <button className="action-btn" onclick="showToast('✓ Script copied to clipboard')">Do it</button>
    </div>

    
    <div className="confidence-card">
      <div className="conf-header">
        <div>
          <h3>Confidence Slider</h3>
          <p>Last updated today</p>
        </div>
        <div className="conf-val" id="conf-display">7</div>
      </div>
      <div className="slider-wrap">
        <input type="range" className="conf-slider" id="conf-slider" min="1" max="10" value="7" oninput="updateConf(this.value)" />
        <div className="conf-labels">
          <span>Won't work</span>
          <span>Not sure</span>
          <span>I'm doing this</span>
        </div>
      </div>
    </div>

    
    <div className="section-label">
      <h2>Your Day-9 Plan</h2>
      <a onclick="navigate('plan')">See all →</a>
    </div>
    <div className="card-grid">
      <div className="day-card completed">
        <div className="day-num">Day 1</div>
        <h3>Update LinkedIn Profile</h3>
        <p>Signal availability to market</p>
        <span className="time-chip">20 min</span>
      </div>
      <div className="day-card completed">
        <div className="day-num">Day 4</div>
        <h3>Send First DMs</h3>
        <p>Script provided, personalised</p>
        <span className="time-chip">20 min</span>
      </div>
      <div className="day-card active-card">
        <div className="day-num">Day 9 ✓</div>
        <h3>Proposal Sent!</h3>
        <p>AI Co-Pilot drafted & sent</p>
        <span className="time-chip">Milestone ⭐</span>
      </div>
      <div className="day-card wide" onclick="navigate('plan')">
        <div>
          <div className="day-num">Days 10–30</div>
          <h3>Extended Plan</h3>
          <p>Negotiate → Contract → First ₹</p>
        </div>
        <div className="more-badge">View Plan</div>
      </div>
    </div>

    
    <div className="section-label">
      <h2>Product Capabilities</h2>
      <a onclick="navigate('caps')">All 8 →</a>
    </div>
    <div style={{padding: '0 20px'}}>
      <div className="day-card wide" onclick="navigate('caps')" style={{background: 'var(--white)', border: '1.5px solid var(--border)', boxShadow: 'var(--shadow-sm)', cursor: 'pointer'}}>
        <div>
          <div className="day-num" style={{color: 'var(--orange)'}}>MVP Infrastructure</div>
          <h3 style={{color: 'var(--text-dark)'}}>Second Salary Core Specs</h3>
          <p style={{color: 'var(--text-mid)'}}>The exact tools missing from your last attempt.</p>
        </div>
        <div className="more-badge" style={{background: 'var(--teal)'}}>Explore</div>
      </div>
    </div>

    
    <div className="section-label">
      <h2>Peers Like You</h2>
      <a onclick="navigate('journey')">Stories →</a>
    </div>
    <div className="peer-scroll">
      <div className="peer-card">
        <div className="peer-top">
          <div className="peer-avatar a1">A</div>
          <div>
            <div className="peer-name">Ananya R.</div>
            <div className="peer-role">Product Designer · Bangalore · 6y exp</div>
          </div>
        </div>
        <div className="peer-story">"Burned by Upwork in 2023. Took 18 months off. Got here via LinkedIn DMs — exactly what the plan said."</div>
        <div className="peer-earned">
          <div>
            <div className="earned-amt">₹38,000</div>
            <div className="earned-label">in 26 days</div>
          </div>
          <span className="verified-badge">✓ Verified</span>
        </div>
      </div>
      <div className="peer-card">
        <div className="peer-top">
          <div className="peer-avatar a2">K</div>
          <div>
            <div className="peer-name">Karthik M.</div>
            <div className="peer-role">UI Designer · Bangalore · 8y exp</div>
          </div>
        </div>
        <div className="peer-story">"Ghosted client, used the Crisis Flow script. Recovered ₹18,000. Still going."</div>
        <div className="peer-earned">
          <div>
            <div className="earned-amt">₹55,000</div>
            <div className="earned-label">in 42 days</div>
          </div>
          <span className="verified-badge">✓ Verified</span>
        </div>
      </div>
      <div className="peer-card">
        <div className="peer-top">
          <div className="peer-avatar a3">S</div>
          <div>
            <div className="peer-name">Sneha T.</div>
            <div className="peer-role">Senior Designer · Chennai · 7y exp</div>
          </div>
        </div>
        <div className="peer-story">"Had zero confidence after 2 failed tries. Day-9 plan broke the paralysis loop."</div>
        <div className="peer-earned">
          <div>
            <div className="earned-amt">₹27,500</div>
            <div className="earned-label">in 31 days</div>
          </div>
          <span className="verified-badge">✓ Verified</span>
        </div>
      </div>
    </div>

    
    <div className="section-label"><h2>Need Help?</h2><span></span></div>
    <div className="crisis-btn" onclick="openCrisisModal()">
      <div className="crisis-icon">🚨</div>
      <div className="crisis-text">
        <h4>Something went wrong with a client</h4>
        <p>Crisis flow → exact script in 90 seconds</p>
      </div>
      <div className="crisis-arrow">›</div>
    </div>

    <div className="spacer"></div>
  </div>

  
  <div className="screen" id="screen-plan">
    <div className="inner-header">
      <div className="back" onclick="navigate('home')">← Back</div>
      <h1>Your Day-9 Plan</h1>
      <p>Senior Product Designer · 6h/week · Bangalore · ₹50K target</p>
    </div>

    <div className="section-label"><h2>9-Day Sprint</h2><a onclick="showToast('📄 PDF downloaded')">Download PDF</a></div>
    <div className="cap-list" style={{gap: '10px'}}>

      <div className="day-card" style={{background: 'var(--white)', border: '1.5px solid var(--success)', borderRadius: 'var(--radius-md)', padding: '16px'}} onclick="toggleDayDetail(this)">
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <div style={{width: '36px', height: '36px', borderRadius: '50%', background: 'var(--success)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13px', flexShrink: '0'}}>✓</div>
          <div style={{flex: '1'}}>
            <div className="day-num">Day 1 — Complete</div>
            <h3 style={{fontSize: '14px', marginTop: '2px'}}>Update LinkedIn headline + About</h3>
            <p style={{fontSize: '12px', color: 'var(--text-mid)', marginTop: '2px'}}>20 min · LinkedIn</p>
          </div>
          <span style={{color: 'var(--text-light)', fontSize: '16px'}} className="expand-arrow">›</span>
        </div>
        <div className="day-detail" style={{display: 'none', marginTop: '12px', padding: '12px', background: 'var(--cream)', borderRadius: 'var(--radius-sm)'}}>
          <p style={{fontSize: '12px', color: 'var(--text-mid)', lineHeight: '1.6'}}><strong>Script provided:</strong> "Senior Product Designer open to consulting & freelance projects — fintech, consumer apps, design systems. DMs open." · Expected: 3–5 profile views in 24h.</p>
        </div>
      </div>

      <div className="day-card" style={{background: 'var(--white)', border: '1.5px solid var(--success)', borderRadius: 'var(--radius-md)', padding: '16px'}} onclick="toggleDayDetail(this)">
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <div style={{width: '36px', height: '36px', borderRadius: '50%', background: 'var(--success)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13px', flexShrink: '0'}}>✓</div>
          <div style={{flex: '1'}}>
            <div className="day-num">Day 2 — Complete</div>
            <h3 style={{fontSize: '14px', marginTop: '2px'}}>LinkedIn post: Design process</h3>
            <p style={{fontSize: '12px', color: 'var(--text-mid)', marginTop: '2px'}}>25 min · LinkedIn</p>
          </div>
          <span style={{color: 'var(--text-light)', fontSize: '16px'}} className="expand-arrow">›</span>
        </div>
        <div className="day-detail" style={{display: 'none', marginTop: '12px', padding: '12px', background: 'var(--cream)', borderRadius: 'var(--radius-sm)'}}>
          <p style={{fontSize: '12px', color: 'var(--text-mid)', lineHeight: '1.6'}}><strong>Template:</strong> "I recently shipped an onboarding flow that reduced drop-off by 34%. Here's what made the difference…" · Signal visibility + professional credibility.</p>
        </div>
      </div>

      <div className="day-card" style={{background: 'var(--white)', border: '1.5px solid var(--success)', borderRadius: 'var(--radius-md)', padding: '16px'}} onclick="toggleDayDetail(this)">
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <div style={{width: '36px', height: '36px', borderRadius: '50%', background: 'var(--success)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13px', flexShrink: '0'}}>✓</div>
          <div style={{flex: '1'}}>
            <div className="day-num">Day 3 — Complete</div>
            <h3 style={{fontSize: '14px', marginTop: '2px'}}>Identify 5 target startups</h3>
            <p style={{fontSize: '12px', color: 'var(--text-mid)', marginTop: '2px'}}>30 min · Research</p>
          </div>
          <span style={{color: 'var(--text-light)', fontSize: '16px'}} className="expand-arrow">›</span>
        </div>
        <div className="day-detail" style={{display: 'none', marginTop: '12px', padding: '12px', background: 'var(--cream)', borderRadius: 'var(--radius-sm)'}}>
          <p style={{fontSize: '12px', color: 'var(--text-mid)', lineHeight: '1.6'}}><strong>Criteria:</strong> Series A/B startups in Bangalore, hiring for product/UI in last 30 days. Find 5 hiring managers via LinkedIn. List their names, company, and hiring signal.</p>
        </div>
      </div>

      <div className="day-card" style={{background: 'var(--white)', border: '1.5px solid var(--success)', borderRadius: 'var(--radius-md)', padding: '16px'}} onclick="toggleDayDetail(this)">
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <div style={{width: '36px', height: '36px', borderRadius: '50%', background: 'var(--success)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13px', flexShrink: '0'}}>✓</div>
          <div style={{flex: '1'}}>
            <div className="day-num">Days 4–5 — Complete</div>
            <h3 style={{fontSize: '14px', marginTop: '2px'}}>Send DMs to all 5 prospects</h3>
            <p style={{fontSize: '12px', color: 'var(--text-mid)', marginTop: '2px'}}>20 min · LinkedIn DM</p>
          </div>
          <span style={{color: 'var(--text-light)', fontSize: '16px'}} className="expand-arrow">›</span>
        </div>
        <div className="day-detail" style={{display: 'none', marginTop: '12px', padding: '12px', background: 'var(--cream)', borderRadius: 'var(--radius-sm)'}}>
          <p style={{fontSize: '12px', color: 'var(--text-mid)', lineHeight: '1.6'}}><strong>Script:</strong> "[Name], I noticed [Company] is building [feature]. I'm a senior product designer specialising in mobile-first flows — I've shipped [result]. Would a short conversation be useful?"</p>
        </div>
      </div>

      <div className="day-card" style={{background: 'var(--white)', border: '1.5px solid var(--orange)', borderRadius: 'var(--radius-md)', padding: '16px'}} onclick="toggleDayDetail(this)">
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <div style={{width: '36px', height: '36px', borderRadius: '50%', background: 'var(--orange)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13px', flexShrink: '0'}}>5</div>
          <div style={{flex: '1'}}>
            <div className="day-num" style={{color: 'var(--orange)'}}>Day 5 — Branch Point ⚡</div>
            <h3 style={{fontSize: '14px', marginTop: '2px'}}>Branch B: Add second channel</h3>
            <p style={{fontSize: '12px', color: 'var(--text-mid)', marginTop: '2px'}}>25 min · Topmate</p>
          </div>
          <span style={{color: 'var(--text-light)', fontSize: '16px'}} className="expand-arrow">›</span>
        </div>
        <div className="day-detail" style={{display: 'none', marginTop: '12px', padding: '12px', background: 'var(--cream)', borderRadius: 'var(--radius-sm)'}}>
          <p style={{fontSize: '12px', color: 'var(--text-mid)', lineHeight: '1.6'}}><strong>Branch selected:</strong> No responses yet — normal. Adding Topmate as a second channel. Set up 30-min design review offering at ₹1,200/session. Creates inbound while outbound matures.</p>
        </div>
      </div>

      <div className="day-card" style={{background: 'var(--teal)', borderRadius: 'var(--radius-md)', padding: '16px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <div style={{width: '36px', height: '36px', borderRadius: '50%', background: 'var(--orange)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13px', flexShrink: '0'}}>⭐</div>
          <div style={{flex: '1'}}>
            <div className="day-num" style={{color: 'var(--orange-light)'}}>Day 9 — MILESTONE</div>
            <h3 style={{fontSize: '14px', marginTop: '2px', color: 'white'}}>First Proposal Sent 🎉</h3>
            <p style={{fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '2px'}}>AI Co-Pilot drafted · LinkedIn email</p>
          </div>
        </div>
      </div>

    </div>
    <div className="spacer"></div>
  </div>

  
  <div className="screen" id="screen-caps">
    <div className="inner-header">
      <div className="back" onclick="navigate('home')">← Back</div>
      <h1>8 Capabilities</h1>
      <p>The infrastructure that was missing last time</p>
    </div>

    <div className="section-label"><h2>MVP Features</h2><span></span></div>
    <div className="cap-list">

      <div className="cap-item" onclick="showToast('Intake & Personalisation — MUST HAVE')">
        <div className="cap-icon c1">📋</div>
        <div className="cap-body">
          <div className="cap-num">Capability 1</div>
          <h3>Intake & Personalisation</h3>
          <p>10-min structured form. 40-skill taxonomy. Profile object that powers every downstream decision.</p>
          <span className="cap-tag must">MUST HAVE</span>
        </div>
        <div className="cap-arrow">›</div>
      </div>

      <div className="cap-item" onclick="showToast('Day-9 Plan — MUST HAVE')">
        <div className="cap-icon c2">📅</div>
        <div className="cap-body">
          <div className="cap-num">Capability 2</div>
          <h3>The Day-9 Plan</h3>
          <p>Personalised day-by-day plan. One action per day, exact script, adaptive branch at Day 5.</p>
          <span className="cap-tag must">MUST HAVE</span>
        </div>
        <div className="cap-arrow">›</div>
      </div>

      <div className="cap-item" onclick="showToast('AI Co-Pilot — MUST HAVE')">
        <div className="cap-icon c3">🤖</div>
        <div className="cap-body">
          <div className="cap-num">Capability 3</div>
          <h3>AI Co-Pilot</h3>
          <p>Proposal generator · Contract builder · Pricing calculator. Channel-aware, protective defaults.</p>
          <span className="cap-tag must">MUST HAVE</span>
        </div>
        <div className="cap-arrow">›</div>
      </div>

      <div className="cap-item" onclick="showToast('Peer Proof Gallery — MUST HAVE')">
        <div className="cap-icon c4">👥</div>
        <div className="cap-body">
          <div className="cap-num">Capability 4</div>
          <h3>Peer Proof Gallery</h3>
          <p>Exact-profile matching. Contextual surfacing at moments of doubt. Verified story badges.</p>
          <span className="cap-tag must">MUST HAVE</span>
        </div>
        <div className="cap-arrow">›</div>
      </div>

      <div className="cap-item" onclick="showToast('₹ Earned Dashboard — MUST HAVE · RICE 20.0')">
        <div className="cap-icon c5">₹</div>
        <div className="cap-body">
          <div className="cap-num">Capability 5</div>
          <h3>₹ Earned Dashboard</h3>
          <p>Hero metric: ₹ earned only. Self-report logging. Milestone celebrations. Confidence slider.</p>
          <span className="cap-tag must">MUST HAVE · RICE 20.0</span>
        </div>
        <div className="cap-arrow">›</div>
      </div>

      <div className="cap-item" onclick="showToast('Async Peer Cohorts — MUST HAVE')">
        <div className="cap-icon c6">💬</div>
        <div className="cap-body">
          <div className="cap-num">Capability 6</div>
          <h3>Async Peer Cohorts</h3>
          <p>5-person auto-assigned. Slack/Discord. Structured prompts at Days 1,5,9,14,21,30. 30-day lifespan.</p>
          <span className="cap-tag must">MUST HAVE</span>
        </div>
        <div className="cap-arrow">›</div>
      </div>

      <div className="cap-item" onclick="showToast('Crisis Flow — MUST HAVE (promoted)')">
        <div className="cap-icon c7">🚨</div>
        <div className="cap-body">
          <div className="cap-num">Capability 7</div>
          <h3>Self-Serve Crisis Flow</h3>
          <p>Triage → response template → cohort routing → path adaptation. One bad client = recoverable event.</p>
          <span className="cap-tag must">MUST HAVE</span>
        </div>
        <div className="cap-arrow">›</div>
      </div>

      <div className="cap-item" onclick="showToast('Channel Targeter — Infrastructure')">
        <div className="cap-icon c8">🎯</div>
        <div className="cap-body">
          <div className="cap-num">Capability 8</div>
          <h3>Channel Targeter</h3>
          <p>Tier 1: LinkedIn, Upwork+. Tier 2: skill-specific. Tier 3: Fiverr (guarded). Tier 0: excluded. Protection wrap on every rec.</p>
          <span className="cap-tag should">INFRASTRUCTURE</span>
        </div>
        <div className="cap-arrow">›</div>
      </div>

    </div>
    <div className="spacer"></div>
  </div>

  
  <div className="screen" id="screen-metrics">
    <div className="inner-header">
      <div className="back" onclick="navigate('home')">← Back</div>
      <h1>Success Metrics</h1>
      <p>If it doesn't track ₹ earned, it doesn't matter</p>
    </div>

    
    <div className="metrics-hero">
      <p>North Star — ₹10K Completion Rate</p>
      <div className="big-num"><span>₹</span>10,000 <span style={{fontSize: '16px', color: 'rgba(255,255,255,0.6)'}}>in 90 days</span></div>
      <div className="target-row">
        <span className="target-label">Target</span>
        <div className="progress-bar-wrap"><div className="progress-bar-fill" style={{width: '70%'}}></div></div>
        <span className="target-pct">≥20%</span>
      </div>
    </div>

    
    <div className="section-label"><h2>Primary — Existential</h2><span></span></div>
    <div className="metric-cards">

      <div className="metric-card">
        <div className="metric-dot primary"></div>
        <div className="metric-body">
          <div className="metric-name">Day-9 Activation Rate</div>
          <div className="metric-def">% of signups who send a real proposal by Day 9</div>
        </div>
        <div className="metric-target">
          <div className="target-val">50%+</div>
          <span className="target-unit">target</span>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-dot primary"></div>
        <div className="metric-body">
          <div className="metric-name">First ₹ Rate</div>
          <div className="metric-def">% of Day-9-activated users who log first ₹ within 30 days</div>
        </div>
        <div className="metric-target">
          <div className="target-val">40%+</div>
          <span className="target-unit">target</span>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-dot primary"></div>
        <div className="metric-body">
          <div className="metric-name">₹10K Completion Rate</div>
          <div className="metric-def">% reaching ₹10K verified within 90 days of signup</div>
        </div>
        <div className="metric-target">
          <div className="target-val">20%+</div>
          <span className="target-unit">at 90 days</span>
        </div>
      </div>
    </div>

    
    <div className="section-label"><h2>Secondary — Capability Health</h2><span></span></div>
    <div className="metric-cards">

      <div className="metric-card">
        <div className="metric-dot secondary"></div>
        <div className="metric-body">
          <div className="metric-name">AI Co-Pilot Send Rate</div>
          <div className="metric-def">% of generated proposals the user actually sends</div>
        </div>
        <div className="metric-target">
          <div className="target-val" style={{color: 'var(--teal)'}}>60%+</div>
          <span className="target-unit">validates A1</span>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-dot secondary"></div>
        <div className="metric-body">
          <div className="metric-name">Cohort Participation Rate</div>
          <div className="metric-def">% of cohort members posting at least once per week</div>
        </div>
        <div className="metric-target">
          <div className="target-val" style={{color: 'var(--teal)'}}>60%+</div>
          <span className="target-unit">validates A2</span>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-dot secondary"></div>
        <div className="metric-body">
          <div className="metric-name">Crisis Recovery Rate</div>
          <div className="metric-def">% of crisis-affected users who log ₹ earned within 60 days</div>
        </div>
        <div className="metric-target">
          <div className="target-val" style={{color: 'var(--teal)'}}>50%+</div>
          <span className="target-unit">target</span>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-dot secondary"></div>
        <div className="metric-body">
          <div className="metric-name">Peer Gallery Engagement</div>
          <div className="metric-def">% clicking a peer story when surfaced contextually</div>
        </div>
        <div className="metric-target">
          <div className="target-val" style={{color: 'var(--teal)'}}>40%+</div>
          <span className="target-unit">target</span>
        </div>
      </div>
    </div>

    
    <div className="section-label"><h2>Anti-Metrics 🚫</h2><span></span></div>
    <div style={{padding: '0 20px'}}>
      <div style={{background: 'var(--white)', borderRadius: 'var(--radius-md)', padding: '16px', border: '1.5px solid var(--border)', boxShadow: 'var(--shadow-sm)'}}>
        <p style={{fontSize: '13px', color: 'var(--text-mid)', lineHeight: '1.8'}}>
          We <strong>do not</strong> optimise for:<br />
          ❌ Time in product / sessions per week<br />
          ❌ Content consumed or lessons watched<br />
          ❌ Streaks or daily engagement gamification<br />
          ❌ Module completion rate (no modules exist)<br />
          ❌ Social shares unprompted<br />
          ❌ Estimated future earnings projections
        </p>
      </div>
    </div>

    <div className="spacer"></div>
  </div>

  
  <div className="screen" id="screen-journey">
    <div className="inner-header">
      <div className="back" onclick="navigate('home')">← Back</div>
      <h1>Risks & Journeys</h1>
      <p>What we're betting on — and how we protect the bet</p>
    </div>

    
    <div className="section-label"><h2>User Journeys</h2><span></span></div>
    <div className="journey-tabs">
      <div className="journey-tab active" onclick="switchJourney(this, 'j1')">Signup → Day 9</div>
      <div className="journey-tab" onclick="switchJourney(this, 'j2')">Day 1–9 Plan</div>
      <div className="journey-tab" onclick="switchJourney(this, 'j3')">First ₹</div>
      <div className="journey-tab" onclick="switchJourney(this, 'j4')">Crisis</div>
    </div>

    <div className="journey-content">

      
      <div className="journey-panel active" id="j1">
        <div className="journey-timeline">
          <div className="timeline-step">
            <div className="timeline-left"><div className="timeline-dot">1</div><div className="timeline-line"></div></div>
            <div className="timeline-body">
              <div className="t-label">Day 0</div>
              <h3>Priya finds Second Salary</h3>
              <p>LinkedIn peer story → landing page with real earnings (no projections) → "See if it's right for you"</p>
            </div>
          </div>
          <div className="timeline-step">
            <div className="timeline-left"><div className="timeline-dot">2</div><div className="timeline-line"></div></div>
            <div className="timeline-body">
              <div className="t-label">Day 0 · 10 min</div>
              <h3>Intake completes</h3>
              <p>Skill: Product Design · 5–10y exp · 6h/wk · Upwork-burned · Balanced risk</p>
              <div className="timeline-card">Profile object generated. Powers every downstream decision.</div>
            </div>
          </div>
          <div className="timeline-step">
            <div className="timeline-left"><div className="timeline-dot orange-dot">3</div><div className="timeline-line"></div></div>
            <div className="timeline-body">
              <div className="t-label">Day 0 → immediately</div>
              <h3>Day-9 Plan generated</h3>
              <p>9 personalised day-cards. Day 1 active. Days 2–9 visible but muted. AI Co-Pilot locked.</p>
            </div>
          </div>
          <div className="timeline-step">
            <div className="timeline-left"><div className="timeline-dot">4</div><div className="timeline-line"></div></div>
            <div className="timeline-body">
              <div className="t-label">Day 1 · 20 min</div>
              <h3>First action taken</h3>
              <p>LinkedIn headline updated using exact script. Marked complete. Product unlocks.</p>
              <div className="timeline-card">Co-Pilot, cohort, and peer gallery now accessible. One peer story shown: Ananya, same profile.</div>
            </div>
          </div>
        </div>
      </div>

      
      <div className="journey-panel" id="j2">
        <div className="journey-timeline">
          <div className="timeline-step">
            <div className="timeline-left"><div className="timeline-dot">D2</div><div className="timeline-line"></div></div>
            <div className="timeline-body">
              <div className="t-label">Day 2</div>
              <h3>LinkedIn post published</h3>
              <p>Template provided. Priya edits one line. Posts. Visibility signal building.</p>
            </div>
          </div>
          <div className="timeline-step">
            <div className="timeline-left"><div className="timeline-dot">D5</div><div className="timeline-line"></div></div>
            <div className="timeline-body">
              <div className="t-label">Day 5 — Branch Point</div>
              <h3>No responses → Branch B</h3>
              <p>Plan adapts. Add Topmate as second channel. Cohort prompt fires: "What's stuck?" Two members respond.</p>
              <div className="timeline-card">Priya doesn't feel alone. Doesn't exit. Continues.</div>
            </div>
          </div>
          <div className="timeline-step">
            <div className="timeline-left"><div className="timeline-dot orange-dot">D7</div><div className="timeline-line"></div></div>
            <div className="timeline-body">
              <div className="t-label">Day 7</div>
              <h3>Discovery call happens</h3>
              <p>One DM responds. 30-min call. Call script and rate-quoting guide used. Prospect asks for a proposal.</p>
            </div>
          </div>
          <div className="timeline-step">
            <div className="timeline-left"><div className="timeline-dot">D9</div></div>
            <div className="timeline-body">
              <div className="t-label">Day 9 — Milestone ⭐</div>
              <h3>Proposal sent via Co-Pilot</h3>
              <p>Gig described → 2 clarifying questions → proposal generated → Priya edits → sends. Celebration triggered.</p>
              <div className="timeline-card">3 peer stories surface: "Here's who else did this in their first 9 days."</div>
            </div>
          </div>
        </div>
      </div>

      
      <div className="journey-panel" id="j3">
        <div className="journey-timeline">
          <div className="timeline-step">
            <div className="timeline-left"><div className="timeline-dot">10</div><div className="timeline-line"></div></div>
            <div className="timeline-body">
              <div className="t-label">Day 10–12</div>
              <h3>Counter-offer negotiation</h3>
              <p>Client counters at ₹38K. Co-Pilot generates: "At ₹38K → 1 revision. At ₹42K → 2 revisions + check-in." Client accepts ₹42K.</p>
            </div>
          </div>
          <div className="timeline-step">
            <div className="timeline-left"><div className="timeline-dot">12</div><div className="timeline-line"></div></div>
            <div className="timeline-body">
              <div className="t-label">Day 12</div>
              <h3>Contract generated & signed</h3>
              <p>Scope clause. 2-revision limit. 50% upfront / 50% on delivery. Kill fee 30%. First contract since 2022.</p>
              <div className="timeline-card">Priya has documentation. Scope creep has a response now.</div>
            </div>
          </div>
          <div className="timeline-step">
            <div className="timeline-left"><div className="timeline-dot orange-dot">20</div><div className="timeline-line"></div></div>
            <div className="timeline-body">
              <div className="t-label">Day 20</div>
              <h3>Scope-change handled</h3>
              <p>Client asks for "one small addition." Script: "Happy to include it — ₹7,000 additional. Shall I add to invoice?" Client accepts.</p>
            </div>
          </div>
          <div className="timeline-step">
            <div className="timeline-left"><div className="timeline-dot">28</div></div>
            <div className="timeline-body">
              <div className="t-label">Day 28 🎉</div>
              <h3>First ₹ logged</h3>
              <p>₹42,000 arrives. Priya logs in 3 taps. Full-screen celebration. Confidence slider: 3 → 8. Story submission prompt.</p>
            </div>
          </div>
        </div>
      </div>

      
      <div className="journey-panel" id="j4">
        <div className="journey-timeline">
          <div className="timeline-step">
            <div className="timeline-left"><div className="timeline-dot" style={{background: 'var(--danger)'}}>!</div><div className="timeline-line"></div></div>
            <div className="timeline-body">
              <div className="t-label">Day 19</div>
              <h3>Client goes quiet</h3>
              <p>No response. WhatsApp, email, LinkedIn all silent. ₹21,000 outstanding. Priya spiralling.</p>
            </div>
          </div>
          <div className="timeline-step">
            <div className="timeline-left"><div className="timeline-dot">T</div><div className="timeline-line"></div></div>
            <div className="timeline-body">
              <div className="t-label">Day 19 · 90 seconds</div>
              <h3>Crisis triage</h3>
              <p>Issue: Ghosted. Stakes: ₹21K. Channel: LinkedIn direct. Timeline: 3 days. Relationship: one-time.</p>
              <div className="timeline-card">Response: 3-message payment chaser sequence. Polite → Firm → Final.</div>
            </div>
          </div>
          <div className="timeline-step">
            <div className="timeline-left"><div className="timeline-dot orange-dot">C</div><div className="timeline-line"></div></div>
            <div className="timeline-body">
              <div className="t-label">Day 19 — cohort routing</div>
              <h3>Shared anonymously with cohort</h3>
              <p>Two members respond within 6 hours. One recovered ₹15K in a similar situation. Priya does not exit.</p>
            </div>
          </div>
          <div className="timeline-step">
            <div className="timeline-left"><div className="timeline-dot" style={{background: 'var(--success)'}}>✓</div></div>
            <div className="timeline-body">
              <div className="t-label">Day 23</div>
              <h3>Recovery + path adapted</h3>
              <p>Client responds. Pays. Next contract defaults to 70% upfront. Channel Targeter notes risk. Karthik's story surfaced.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    
    <div className="section-label" style={{marginTop: '20px'}}><h2>Key Risks</h2><span></span></div>
    <div className="risk-cards">
      <div className="risk-card existential" onclick="this.classList.toggle('open')">
        <div className="risk-header">
          <h3>R1 — AI output not good enough to send</h3>
          <span className="risk-badge existential">Existential</span>
        </div>
        <div className="risk-body">If users don't trust Co-Pilot drafts enough to send them, the Day-9 milestone collapses and the entire activation model fails.</div>
        <div className="risk-mitigation">
          <strong>Mitigation:</strong> Wizard-of-oz test pre-build with 10–15 users. Hard quality gate: Co-Pilot Send Rate ≥ 40% before public launch. Tone variants + "explain why" function build trust.
        </div>
        <div className="risk-footer">
          <span>Discovery: A1 assumption · P-04</span>
          <span className="risk-arrow">▾</span>
        </div>
      </div>

      <div className="risk-card existential" onclick="this.classList.toggle('open')">
        <div className="risk-header">
          <h3>R2 — Async cohorts don't replicate coach accountability</h3>
          <span className="risk-badge existential">Existential</span>
        </div>
        <div className="risk-body">5-person Slack cohorts may generate low participation, feel hollow, and fail to carry the accountability load a coach would have provided.</div>
        <div className="risk-mitigation">
          <strong>Mitigation:</strong> Structured prompts are non-negotiable. 7-day silence detection → team intervention. Cohort Participation Rate ≥ 40% gate. Quantitative correlation test at Day 60.
        </div>
        <div className="risk-footer">
          <span>Discovery: A2 assumption · Theme 6 · H8</span>
          <span className="risk-arrow">▾</span>
        </div>
      </div>

      <div className="risk-card medium" onclick="this.classList.toggle('open')">
        <div className="risk-header">
          <h3>R3 — Content lock drives exits not action</h3>
          <span className="risk-badge medium">High</span>
        </div>
        <div className="risk-body">Locking Co-Pilot and community behind Day-1 action is perceived as coercive, not enabling. Users who want to explore first may leave.</div>
        <div className="risk-mitigation">
          <strong>Mitigation:</strong> Copy tone is critical — "unlock" not "locked out." Preview one peer story pre-Day-1. Show exactly what unlocks. Monitor Day-1 Action Rate from day one of beta.
        </div>
        <div className="risk-footer">
          <span>Discovery: A4 assumption · P-21, P-24</span>
          <span className="risk-arrow">▾</span>
        </div>
      </div>

      <div className="risk-card medium" onclick="this.classList.toggle('open')">
        <div className="risk-header">
          <h3>R4 — Peer Gallery empty at launch</h3>
          <span className="risk-badge high">High</span>
        </div>
        <div className="risk-body">The gallery that does the trust work is empty at launch. Users see a blank gallery and conclude the product is unproven.</div>
        <div className="risk-mitigation">
          <strong>Mitigation:</strong> 20–30 beta users recruited 60–90 days before public launch. Seed gallery with their verified stories. Transparent "Early user" label. Target ≥5 verified stories at launch.
        </div>
        <div className="risk-footer">
          <span>Discovery: Cold start · P-20 · P-26</span>
          <span className="risk-arrow">▾</span>
        </div>
      </div>

      <div className="risk-card low" onclick="this.classList.toggle('open')">
        <div className="risk-header">
          <h3>R5 — User stalls at Day 5 with no responses</h3>
          <span className="risk-badge low">Medium</span>
        </div>
        <div className="risk-body">The Day-5 branch logic detects a stall, but the user doesn't trust the reoriented plan enough to continue. Confidence drops.</div>
        <div className="risk-mitigation">
          <strong>Mitigation:</strong> Day-4 card explicitly sets expectations ("normal to have no responses"). Branch B must feel like a real pivot. Cohort prompt surfaces peer stories. 48h nudge email fires.
        </div>
        <div className="risk-footer">
          <span>Discovery: P-22 dropout pattern · Day-9 cliff</span>
          <span className="risk-arrow">▾</span>
        </div>
      </div>
    </div>

    <div className="spacer"></div>
  </div>

  
  <div className="screen" id="screen-copilot">
    <div className="inner-header">
      <div className="back" onclick="navigate('home')">← Back</div>
      <h1>AI Co-Pilot Workspace</h1>
      <p>Sleek, protective automation. Turn client requests into verified scopes.</p>
    </div>
    
    <div className="copilot-tabs">
      <div className="copilot-tab active" id="tab-proposal" onclick="switchCopilotTab('proposal')">Proposal Builder</div>
      <div className="copilot-tab" id="tab-contract" onclick="switchCopilotTab('contract')">Contract Builder</div>
      <div className="copilot-tab" id="tab-calc" onclick="switchCopilotTab('calc')">Pricing Calculator</div>
    </div>

    
    <div className="copilot-panel active" id="panel-proposal">
      <div className="form-field">
        <label>Client Industry & Brief Description</label>
        <input type="text" id="prop-client" placeholder="e.g. Series-A fintech startup, payment onboarding redesign" />
      </div>
      <div className="form-field">
        <label>Scope of Deliverables</label>
        <input type="text" id="prop-scope" placeholder="e.g. 5 mobile screens, Figma files, interactive prototype" />
      </div>
      <div className="form-field">
        <label>Select Tone Option</label>
        <select id="prop-tone">
          <option value="collaborative">Collaborative & Peer-to-Peer (Highly Recommended)</option>
          <option value="direct">Direct & Value-Focused</option>
          <option value="expert">Premium Expert Advice (High Price Anchor)</option>
        </select>
      </div>
      <button className="modal-btn" onclick="generateProposal()">🤖 Generate Draft Proposal</button>
      
      <div className="copilot-output-card" id="proposal-output-wrap" style={{display: 'none'}}>
        <button className="copy-btn" onclick="copyCopilotText('proposal-text')">Copy Draft</button>
        <h4 style={{color: 'var(--orange)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Generated Proposal Pitch</h4>
        <div className="output-pre" id="proposal-text"></div>
      </div>
    </div>

    
    <div className="copilot-panel" id="panel-contract">
      <div className="form-field">
        <label>Proposed Project Fee (₹)</label>
        <input type="number" id="contract-fee" placeholder="e.g. 50000" />
      </div>
      <div className="form-field">
        <label>Number of revision iterations included</label>
        <select id="contract-revisions">
          <option value="1">1 Revision Cycle (Protective Standard)</option>
          <option value="2" selected>2 Revision Cycles (Standard)</option>
          <option value="3">3 Revision Cycles (High Service)</option>
        </select>
      </div>
      <button className="modal-btn" style={{background: 'var(--teal)'}} onclick="generateContract()">📝 Generate Protective Clauses</button>
      
      <div className="copilot-output-card" id="contract-output-wrap" style={{display: 'none'}}>
        <button className="copy-btn" onclick="copyCopilotText('contract-text')">Copy Clauses</button>
        <h4 style={{color: 'var(--orange)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Protective Scope & Payment Clauses</h4>
        <div className="output-pre" id="contract-text"></div>
      </div>
    </div>

    
    <div className="copilot-panel" id="panel-calc">
      <div className="calc-box">
        <div className="calc-row">
          <span className="calc-label">Target Monthly Side Income</span>
          <span className="calc-value" id="calc-income-val">₹50,000</span>
        </div>
        <div className="calc-slider-wrap">
          <input type="range" className="conf-slider" id="calc-income" min="10000" max="150000" step="5000" value="50000" oninput="updatePricingCalc()" />
        </div>

        <div className="calc-row" style={{marginTop: '20px'}}>
          <span className="calc-label">Weekly Working Hours</span>
          <span className="calc-value" id="calc-hours-val">6 hrs</span>
        </div>
        <div className="calc-slider-wrap">
          <input type="range" className="conf-slider" id="calc-hours" min="4" max="24" value="6" oninput="updatePricingCalc()" />
        </div>
      </div>

      <div className="calc-results">
        <div className="calc-res-card">
          <h4>Hourly Rate Target</h4>
          <div className="res-val" id="calc-res-hourly" style={{color: 'var(--teal)'}}>₹1,920</div>
        </div>
        <div className="calc-res-card">
          <h4>Min Retainer / Mo</h4>
          <div className="res-val" id="calc-res-retainer" style={{color: 'var(--orange)'}}>₹50,000</div>
        </div>
        <div className="calc-res-card wide-card">
          <h4>Recommended Project Pricing Anchor</h4>
          <div className="res-val" id="calc-res-project">₹75,000</div>
          <p style={{fontSize: '10px', opacity: '0.8', marginTop: '6px'}}>Calculated with a 1.5x protective value buffer for scope management.</p>
        </div>
      </div>
    </div>
    
    <div className="spacer"></div>
  </div>

  
  <div className="screen" id="screen-cohort">
    <div className="inner-header">
      <div className="back" onclick="navigate('home')">← Back</div>
      <h1>Cohort #142 (Async)</h1>
      <p>Your 5-person accountability group. Auto-assigned, peer verified.</p>
    </div>

    
    <div style={{padding: '16px 20px 0'}}>
      <div className="chat-system-prompt">
        📢 <strong>Structured Cohort Challenge:</strong><br />
        <span id="cohort-challenge-text">Day 9 Sprint Target: Send your first proposal pitch draft today. Share your progress or post questions if you feel stuck!</span>
      </div>
    </div>

    
    <div className="chat-container" id="chat-messages-container">
      <div className="chat-bubble left">
        <div className="chat-avatar a1">AR</div>
        <div className="chat-bubble-body">
          <div className="chat-user-name">Ananya R.</div>
          <p className="chat-text">Just finished customizing my proposal copy using the Day 9 script! The protective scope clause in the contract builder is key.</p>
          <div className="chat-time">9:14 AM</div>
        </div>
      </div>

      <div className="chat-bubble left">
        <div className="chat-avatar a2">KM</div>
        <div className="chat-bubble-body">
          <div className="chat-user-name">Karthik M.</div>
          <p className="chat-text">My client tried to slip in a last-minute dashboard screen. Literally copy-pasted the Co-Pilot revisions limit script. They agreed to pay an extra ₹8,000 without any argument!</p>
          <div className="chat-time">10:02 AM</div>
        </div>
      </div>

      <div className="chat-bubble left">
        <div className="chat-avatar a3">ST</div>
        <div className="chat-bubble-body">
          <div className="chat-user-name">Sneha T.</div>
          <p className="chat-text">I was totally blocked on rate quoting. Checked the pricing calculator, anchored hourly target at ₹2,500. Just quoted ₹45,000 for a 3-week project. Wish me luck!</p>
          <div className="chat-time">10:15 AM</div>
        </div>
      </div>
      
      
    </div>

    
    <div className="chat-input-row">
      <input type="text" id="chat-input-field" placeholder="Type a message to your cohort..." onkeypress="handleChatKeyPress(event)" />
      <button className="chat-send-btn" onclick="sendCohortMessage()">➔</button>
    </div>
    
    <div className="spacer"></div>
  </div>

  
  <div className="screen" id="screen-specs">
    <div className="inner-header">
      <div className="back" onclick="navigate('home')">← Back</div>
      <h1>Specs & Tools Hub</h1>
      <p>Explore MVP product features, success metrics, risk sheets, and channel targets.</p>
    </div>

    <div className="menu-grid">
      <div className="menu-card" onclick="navigate('caps')">
        <div className="m-icon">📋</div>
        <h3>8 Capabilities</h3>
        <p>Full functional breakdown of MVP features.</p>
      </div>

      <div className="menu-card" onclick="navigate('metrics')">
        <div className="m-icon">📊</div>
        <h3>Success Metrics</h3>
        <p>Success criteria, primary & anti-metrics.</p>
      </div>

      <div className="menu-card" onclick="navigate('journey')">
        <div className="m-icon">🗺️</div>
        <h3>Risks & Mitigations</h3>
        <p>Key architectural bets and timelines.</p>
      </div>

      <div className="menu-card" onclick="navigate('channels')">
        <div className="m-icon">🎯</div>
        <h3>Channel Targeter</h3>
        <p>Strategic platforms & safety wrap guidelines.</p>
      </div>
    </div>
    
    
    <div style={{padding: '0 20px', marginTop: '10px'}}>
      <div className="day-card wide" onclick="resetProfileSimulation()" style={{background: '#FFF3E8', border: '1.5px dashed var(--orange)', cursor: 'pointer'}}>
        <div>
          <div className="day-num" style={{color: 'var(--orange-dark)'}}>Developer Tool</div>
          <h3 style={{color: 'var(--text-dark)'}}>Reset Profile & Restart Intake</h3>
          <p style={{color: 'var(--text-mid)'}}>Re-run onboarding wizard simulation.</p>
        </div>
        <div className="more-badge" style={{background: 'var(--orange)'}}>Reset</div>
      </div>
    </div>
    
    <div className="spacer"></div>
  </div>

  
  <div className="screen" id="screen-channels">
    <div className="inner-header">
      <div className="back" onclick="navigate('specs')">← Back</div>
      <h1>Channel Targeter</h1>
      <p>Platforms matched to your skill profile with built-in protective wraps.</p>
    </div>

    <div className="section-label"><h2>Platform Matches</h2><span></span></div>
    
    <div className="channel-list">
      
      <div className="channel-card">
        <div style={{fontSize: '32px'}}>💼</div>
        <div className="channel-card-body">
          <span className="channel-badge t1">Tier 1 — Recommended</span>
          <h3>LinkedIn Professional</h3>
          <p>Primary target for inbound and outbound consulting. Leverage verified peer proof cards.</p>
          <div className="channel-wrap-guide">
            <strong>Safety-Wrap Guardrail:</strong> Always redirect prospects from comments/messages to a structured Topmate call. Never quote hourly pricing on chat.
          </div>
        </div>
      </div>

      <div className="channel-card">
        <div style={{fontSize: '32px'}}>⏱️</div>
        <div className="channel-card-body">
          <span className="channel-badge t2">Tier 2 — Landing Page</span>
          <h3>Topmate Consulting</h3>
          <p>Perfect for structured 30-minute expert consulting sessions. High-conversion inbound tool.</p>
          <div className="channel-wrap-guide">
            <strong>Safety-Wrap Guardrail:</strong> Charge 100% pre-payment inside Topmate before scheduling. Cap calls strictly at 30 minutes to manage your 6h/week commitment.
          </div>
        </div>
      </div>

      <div className="channel-card" id="upwork-channel-card">
        <div style={{fontSize: '32px'}}>🛡️</div>
        <div className="channel-card-body">
          <span className="channel-badge t2" id="upwork-badge-text">Tier 2 — Guarded Access</span>
          <h3 id="upwork-title-text">Upwork (Safety Wrap Enabled)</h3>
          <p id="upwork-desc-text">For clients seeking mobile & UX designers. Pre-configured filters active.</p>
          <div className="channel-wrap-guide" id="upwork-guide-text">
            <strong>Safety-Wrap Guardrail:</strong> Strict escrow contract activated. Never share email address before contract is funded. Minimum project value: ₹15,000.
          </div>
        </div>
      </div>

      <div className="channel-card" style={{opacity: '0.55'}} id="fiverr-channel-card">
        <div style={{fontSize: '32px'}}>🚫</div>
        <div className="channel-card-body">
          <span className="channel-badge t3" style={{background: '#FFEBEE', color: 'var(--danger)'}}>Tier 3 — Excluded</span>
          <h3>Fiverr (Guarded Exclusion)</h3>
          <p>Freelance marketplace offering low cost consulting. Deliberately locked out of profile recommendations.</p>
          <div className="channel-wrap-guide" style={{borderLeftColor: 'var(--danger)'}}>
            <strong>Rationale:</strong> Direct violation of the Burnt Starter target rate. Fosters transactional, cheap scope-creep behavior that induces paralysis. Excluded.
          </div>
        </div>
      </div>

    </div>
    <div className="spacer"></div>
  </div>

  
  <nav className="bottom-nav">
    <div className="nav-item" id="nav-home" onclick="navigate('home')">
      <div className="nav-icon">⊞</div>
      <div className="nav-label">Home</div>
      <div className="nav-dot"></div>
    </div>
    <div className="nav-item" id="nav-plan" onclick="navigate('plan')">
      <div className="nav-icon">📅</div>
      <div className="nav-label">Day Plan</div>
      <div className="nav-dot"></div>
    </div>
    <div className="nav-plus" onclick="openLogModal()" title="Log Earnings">＋</div>
    <div className="nav-item" id="nav-copilot" onclick="navigate('copilot')">
      <div className="nav-icon">🤖</div>
      <div className="nav-label">Co-Pilot</div>
      <div className="nav-dot"></div>
    </div>
    <div className="nav-item" id="nav-cohort" onclick="navigate('cohort')">
      <div className="nav-icon">💬</div>
      <div className="nav-label">Cohort</div>
      <div className="nav-dot"></div>
    </div>
    <div className="nav-item" id="nav-specs" onclick="navigate('specs')">
      <div className="nav-icon">⚙️</div>
      <div className="nav-label">Specs Hub</div>
      <div className="nav-dot"></div>
    </div>
  </nav>

  
  <button id="screenshot-fab" className="screenshot-fab" onclick="captureScreen()" title="Download Crisp Screenshot">📸</button>

</div>


<div className="modal-overlay" id="log-modal" onclick="handleModalClick(event, 'log-modal')">
  <div className="modal-sheet" style={{position: 'relative'}}>
    <span className="modal-close" onclick="closeModal('log-modal')">✕</span>
    <div className="modal-handle"></div>
    <h2>Log Earnings</h2>
    <p>Self-report in under 60 seconds. Invoice upload = Verified badge.</p>
    <div className="form-field">
      <label>Amount (₹)</label>
      <input type="number" id="earn-amount" placeholder="e.g. 42000" />
    </div>
    <div className="form-field">
      <label>Channel</label>
      <select id="earn-channel">
        <option value="">Select channel</option>
        <option>LinkedIn</option>
        <option>Upwork</option>
        <option>Topmate</option>
        <option>Direct / Referral</option>
        <option>Fiverr</option>
        <option>Other</option>
      </select>
    </div>
    <div className="form-field">
      <label>Client name (optional — anonymised)</label>
      <input type="text" placeholder="e.g. Startup Co." />
    </div>
    <button className="modal-btn" onclick="logEarnings()">₹ Log Earnings</button>
  </div>
</div>


<div className="modal-overlay" id="crisis-modal" onclick="handleModalClick(event, 'crisis-modal')">
  <div className="modal-sheet" style={{position: 'relative'}}>
    <span className="modal-close" onclick="closeModal('crisis-modal')">✕</span>
    <div className="modal-handle"></div>
    <h2>Crisis Triage 🚨</h2>
    <p>90 seconds. Exact script. You don't have to figure this out alone.</p>
    <div className="form-field">
      <label>What happened?</label>
      <select id="crisis-type">
        <option value="">Select situation</option>
        <option>Ghosted after delivery</option>
        <option>Scope creep without pay</option>
        <option>Late / non-payment</option>
        <option>Unfair feedback</option>
        <option>Quality dispute</option>
        <option>Harassment</option>
        <option>Other</option>
      </select>
    </div>
    <div className="form-field">
      <label>₹ at stake</label>
      <input type="number" placeholder="e.g. 21000" />
    </div>
    <div className="form-field">
      <label>Platform / channel</label>
      <select>
        <option value="">Select platform</option>
        <option>LinkedIn / Direct</option>
        <option>Upwork</option>
        <option>Fiverr</option>
        <option>Topmate</option>
        <option>Other</option>
      </select>
    </div>
    <button className="modal-btn" style={{background: 'var(--danger)', boxShadow: '0 6px 20px rgba(224,90,90,0.35)'}} onclick="generateCrisisScript()">Get My Script →</button>
  </div>
</div>


<div className="celebrate-overlay" id="celebrate">
  <div className="celebrate-box">
    <div className="celebrate-emoji">🎉</div>
    <h2>You earned it.</h2>
    <div className="celebrate-amount" id="celebrate-amount">₹42,000</div>
    <p>That's real money from your skill. This is what Second Salary is for.</p>
    <button className="celebrate-close" onclick="closeCelebrate()">Share My Story →</button>
  </div>
</div>


<div className="toast" id="toast"></div>


<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>


    </>
  );
}
