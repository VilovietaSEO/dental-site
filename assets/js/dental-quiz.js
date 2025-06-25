/* Modern Dental Care - Dental Health Assessment Quiz */
/* Version: 1.0.0 */

(function() {
    'use strict';

    // Quiz Configuration
    const QUIZ_CONFIG = {
        VERSION: '1.0',
        TOTAL_QUESTIONS: 15,
        PROFILES: {
            GUARDIAN: {
                id: 'guardian',
                name: 'The Guardian',
                color: '#28A745',
                description: 'Excellent preventive care habits with minimal dental issues',
                recommendations: ['Regular cleanings', 'Teeth whitening', 'Preventive sealants'],
                icon: '🛡️'
            },
            WARRIOR: {
                id: 'warrior', 
                name: 'The Warrior',
                color: '#FF6B35',
                description: 'Currently fighting active dental issues that need treatment',
                recommendations: ['Restorative care', 'Root canals', 'Crowns & bridges'],
                icon: '⚔️'
            },
            EXPLORER: {
                id: 'explorer',
                name: 'The Explorer',
                color: '#00A8A8',
                description: 'Interested in cosmetic improvements and enhancing your smile',
                recommendations: ['Veneers', 'Invisalign', 'Teeth whitening', 'Smile makeover'],
                icon: '🧭'
            },
            REBUILDER: {
                id: 'rebuilder',
                name: 'The Rebuilder',
                color: '#0077BE',
                description: 'Requires significant restorative work to rebuild oral health',
                recommendations: ['Dental implants', 'Dentures', 'Full mouth reconstruction'],
                icon: '🔨'
            }
        }
    };

    // Quiz Questions
    const QUIZ_QUESTIONS = [
        {
            id: 1,
            question: "How often do you visit the dentist?",
            answers: [
                { text: "Every 6 months", points: { guardian: 3, warrior: 0, explorer: 1, rebuilder: 0 } },
                { text: "Once a year", points: { guardian: 2, warrior: 1, explorer: 1, rebuilder: 0 } },
                { text: "Only when I have pain", points: { guardian: 0, warrior: 3, explorer: 0, rebuilder: 2 } },
                { text: "Can't remember my last visit", points: { guardian: 0, warrior: 2, explorer: 0, rebuilder: 3 } }
            ]
        },
        {
            id: 2,
            question: "How would you describe your current dental health?",
            answers: [
                { text: "Excellent - no issues", points: { guardian: 3, warrior: 0, explorer: 1, rebuilder: 0 } },
                { text: "Good - minor issues", points: { guardian: 2, warrior: 1, explorer: 2, rebuilder: 0 } },
                { text: "Fair - several problems", points: { guardian: 0, warrior: 3, explorer: 1, rebuilder: 2 } },
                { text: "Poor - many issues", points: { guardian: 0, warrior: 2, explorer: 0, rebuilder: 3 } }
            ]
        },
        {
            id: 3,
            question: "What's your primary dental concern right now?",
            answers: [
                { text: "Maintaining healthy teeth", points: { guardian: 3, warrior: 0, explorer: 0, rebuilder: 0 } },
                { text: "Treating pain or decay", points: { guardian: 0, warrior: 3, explorer: 0, rebuilder: 1 } },
                { text: "Improving appearance", points: { guardian: 0, warrior: 0, explorer: 3, rebuilder: 0 } },
                { text: "Major restoration needed", points: { guardian: 0, warrior: 1, explorer: 0, rebuilder: 3 } }
            ]
        },
        {
            id: 4,
            question: "How do you feel about your smile?",
            answers: [
                { text: "Love it!", points: { guardian: 3, warrior: 0, explorer: 0, rebuilder: 0 } },
                { text: "It's okay", points: { guardian: 2, warrior: 1, explorer: 1, rebuilder: 0 } },
                { text: "Want to improve it", points: { guardian: 0, warrior: 0, explorer: 3, rebuilder: 1 } },
                { text: "Embarrassed by it", points: { guardian: 0, warrior: 1, explorer: 2, rebuilder: 3 } }
            ]
        },
        {
            id: 5,
            question: "Do you experience dental pain or sensitivity?",
            answers: [
                { text: "Never", points: { guardian: 3, warrior: 0, explorer: 1, rebuilder: 0 } },
                { text: "Occasionally", points: { guardian: 1, warrior: 2, explorer: 1, rebuilder: 1 } },
                { text: "Frequently", points: { guardian: 0, warrior: 3, explorer: 0, rebuilder: 2 } },
                { text: "Constant pain", points: { guardian: 0, warrior: 3, explorer: 0, rebuilder: 3 } }
            ]
        },
        {
            id: 6,
            question: "How many cavities have you had in the past 5 years?",
            answers: [
                { text: "None", points: { guardian: 3, warrior: 0, explorer: 1, rebuilder: 0 } },
                { text: "1-2", points: { guardian: 2, warrior: 1, explorer: 1, rebuilder: 0 } },
                { text: "3-5", points: { guardian: 0, warrior: 3, explorer: 0, rebuilder: 2 } },
                { text: "More than 5", points: { guardian: 0, warrior: 2, explorer: 0, rebuilder: 3 } }
            ]
        },
        {
            id: 7,
            question: "How often do you brush your teeth?",
            answers: [
                { text: "Twice daily or more", points: { guardian: 3, warrior: 0, explorer: 1, rebuilder: 0 } },
                { text: "Once daily", points: { guardian: 1, warrior: 2, explorer: 1, rebuilder: 1 } },
                { text: "Few times a week", points: { guardian: 0, warrior: 2, explorer: 0, rebuilder: 2 } },
                { text: "Rarely", points: { guardian: 0, warrior: 1, explorer: 0, rebuilder: 3 } }
            ]
        },
        {
            id: 8,
            question: "Do you have any missing teeth?",
            answers: [
                { text: "No missing teeth", points: { guardian: 3, warrior: 0, explorer: 1, rebuilder: 0 } },
                { text: "1-2 missing", points: { guardian: 0, warrior: 2, explorer: 1, rebuilder: 2 } },
                { text: "3-5 missing", points: { guardian: 0, warrior: 1, explorer: 0, rebuilder: 3 } },
                { text: "Many missing", points: { guardian: 0, warrior: 0, explorer: 0, rebuilder: 3 } }
            ]
        },
        {
            id: 9,
            question: "What's your interest in cosmetic dentistry?",
            answers: [
                { text: "Not interested", points: { guardian: 2, warrior: 1, explorer: 0, rebuilder: 1 } },
                { text: "Slightly interested", points: { guardian: 1, warrior: 0, explorer: 2, rebuilder: 0 } },
                { text: "Very interested", points: { guardian: 0, warrior: 0, explorer: 3, rebuilder: 0 } },
                { text: "Need it for confidence", points: { guardian: 0, warrior: 0, explorer: 3, rebuilder: 2 } }
            ]
        },
        {
            id: 10,
            question: "How are your gums?",
            answers: [
                { text: "Healthy pink gums", points: { guardian: 3, warrior: 0, explorer: 1, rebuilder: 0 } },
                { text: "Occasional bleeding", points: { guardian: 1, warrior: 2, explorer: 1, rebuilder: 1 } },
                { text: "Frequent bleeding/swelling", points: { guardian: 0, warrior: 3, explorer: 0, rebuilder: 2 } },
                { text: "Severe gum disease", points: { guardian: 0, warrior: 2, explorer: 0, rebuilder: 3 } }
            ]
        },
        {
            id: 11,
            question: "Have you had any dental emergencies?",
            answers: [
                { text: "Never", points: { guardian: 3, warrior: 0, explorer: 1, rebuilder: 0 } },
                { text: "One minor incident", points: { guardian: 2, warrior: 1, explorer: 1, rebuilder: 0 } },
                { text: "Several emergencies", points: { guardian: 0, warrior: 3, explorer: 0, rebuilder: 2 } },
                { text: "Frequent emergencies", points: { guardian: 0, warrior: 2, explorer: 0, rebuilder: 3 } }
            ]
        },
        {
            id: 12,
            question: "What's your age range?",
            answers: [
                { text: "Under 30", points: { guardian: 2, warrior: 1, explorer: 2, rebuilder: 0 } },
                { text: "30-45", points: { guardian: 1, warrior: 2, explorer: 2, rebuilder: 1 } },
                { text: "45-60", points: { guardian: 1, warrior: 2, explorer: 1, rebuilder: 2 } },
                { text: "Over 60", points: { guardian: 1, warrior: 1, explorer: 0, rebuilder: 3 } }
            ]
        },
        {
            id: 13,
            question: "How important is having a perfect smile to you?",
            answers: [
                { text: "Not important", points: { guardian: 2, warrior: 1, explorer: 0, rebuilder: 1 } },
                { text: "Somewhat important", points: { guardian: 1, warrior: 0, explorer: 2, rebuilder: 0 } },
                { text: "Very important", points: { guardian: 0, warrior: 0, explorer: 3, rebuilder: 1 } },
                { text: "Life-changing important", points: { guardian: 0, warrior: 0, explorer: 3, rebuilder: 2 } }
            ]
        },
        {
            id: 14,
            question: "Do you grind or clench your teeth?",
            answers: [
                { text: "Never", points: { guardian: 3, warrior: 0, explorer: 1, rebuilder: 0 } },
                { text: "Sometimes when stressed", points: { guardian: 1, warrior: 2, explorer: 1, rebuilder: 1 } },
                { text: "Regularly at night", points: { guardian: 0, warrior: 3, explorer: 0, rebuilder: 2 } },
                { text: "Constantly", points: { guardian: 0, warrior: 3, explorer: 0, rebuilder: 3 } }
            ]
        },
        {
            id: 15,
            question: "What's your dental insurance situation?",
            answers: [
                { text: "Great coverage", points: { guardian: 2, warrior: 1, explorer: 2, rebuilder: 1 } },
                { text: "Basic coverage", points: { guardian: 2, warrior: 2, explorer: 1, rebuilder: 1 } },
                { text: "No insurance", points: { guardian: 1, warrior: 2, explorer: 1, rebuilder: 2 } },
                { text: "Need financing options", points: { guardian: 0, warrior: 2, explorer: 2, rebuilder: 3 } }
            ]
        }
    ];

    // Quiz State Management
    class DentalQuiz {
        constructor() {
            this.currentQuestion = 0;
            this.answers = [];
            this.scores = {
                guardian: 0,
                warrior: 0,
                explorer: 0,
                rebuilder: 0
            };
            this.profile = null;
            this.startTime = null;
            this.isActive = false;
        }

        init() {
            this.bindEvents();
            this.loadProgress();
            this.setupFloatingWidget();
        }

        bindEvents() {
            // Quiz start buttons
            document.addEventListener('click', (e) => {
                if (e.target.matches('[data-quiz-start]')) {
                    e.preventDefault();
                    this.start();
                }
                
                if (e.target.matches('[data-quiz-answer]')) {
                    const answerIndex = parseInt(e.target.dataset.quizAnswer);
                    this.selectAnswer(answerIndex);
                }
                
                if (e.target.matches('[data-quiz-next]')) {
                    this.nextQuestion();
                }
                
                if (e.target.matches('[data-quiz-prev]')) {
                    this.previousQuestion();
                }
                
                if (e.target.matches('[data-quiz-restart]')) {
                    this.restart();
                }
            });
        }

        setupFloatingWidget() {
            const widget = document.createElement('div');
            widget.className = 'quiz-widget';
            widget.innerHTML = `
                <button class="quiz-widget-toggle" aria-label="Take dental health quiz">
                    <span class="quiz-widget-icon">📋</span>
                    <span class="quiz-widget-text">Take Our Quiz!</span>
                </button>
            `;
            
            document.body.appendChild(widget);
            
            widget.querySelector('.quiz-widget-toggle').addEventListener('click', () => {
                this.start();
            });
        }

        start() {
            this.isActive = true;
            this.startTime = Date.now();
            this.showQuizModal();
            this.renderQuestion();
            
            // Track quiz start
            if (window.DentalSite && window.DentalSite.Analytics) {
                window.DentalSite.Analytics.track('Quiz Started', {
                    timestamp: new Date().toISOString()
                });
            }
        }

        showQuizModal() {
            const existingModal = document.getElementById('quiz-modal');
            if (existingModal) {
                existingModal.remove();
            }

            const modal = document.createElement('div');
            modal.id = 'quiz-modal';
            modal.className = 'quiz-modal';
            modal.innerHTML = `
                <div class="quiz-modal-content">
                    <button class="quiz-close" aria-label="Close quiz">&times;</button>
                    <div class="quiz-header">
                        <h2>Dental Health Assessment</h2>
                        <div class="quiz-progress">
                            <div class="quiz-progress-bar">
                                <div class="quiz-progress-fill" style="width: 0%"></div>
                            </div>
                            <span class="quiz-progress-text">Question 1 of ${QUIZ_CONFIG.TOTAL_QUESTIONS}</span>
                        </div>
                    </div>
                    <div class="quiz-body">
                        <!-- Question content will be inserted here -->
                    </div>
                    <div class="quiz-footer">
                        <button class="btn btn-outline" data-quiz-prev style="display: none;">Previous</button>
                        <button class="btn btn-primary" data-quiz-next disabled>Next</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            modal.classList.add('open');

            // Close button
            modal.querySelector('.quiz-close').addEventListener('click', () => {
                this.close();
            });

            // Close on backdrop click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.close();
                }
            });
        }

        renderQuestion() {
            const question = QUIZ_QUESTIONS[this.currentQuestion];
            const quizBody = document.querySelector('.quiz-body');
            
            if (!quizBody) return;

            quizBody.innerHTML = `
                <div class="quiz-question">
                    <h3>${question.question}</h3>
                    <div class="quiz-answers">
                        ${question.answers.map((answer, index) => `
                            <button class="quiz-answer-btn" data-quiz-answer="${index}">
                                ${answer.text}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;

            // Update progress
            this.updateProgress();

            // Show/hide navigation buttons
            const prevBtn = document.querySelector('[data-quiz-prev]');
            const nextBtn = document.querySelector('[data-quiz-next]');
            
            if (prevBtn) {
                prevBtn.style.display = this.currentQuestion > 0 ? 'block' : 'none';
            }
            
            if (nextBtn) {
                nextBtn.disabled = !this.answers[this.currentQuestion];
                nextBtn.textContent = this.currentQuestion === QUIZ_CONFIG.TOTAL_QUESTIONS - 1 ? 'Get Results' : 'Next';
            }

            // Restore selected answer if any
            if (this.answers[this.currentQuestion] !== undefined) {
                const selectedBtn = quizBody.querySelector(`[data-quiz-answer="${this.answers[this.currentQuestion]}"]`);
                if (selectedBtn) {
                    selectedBtn.classList.add('selected');
                }
            }
        }

        selectAnswer(answerIndex) {
            this.answers[this.currentQuestion] = answerIndex;
            
            // Update UI
            const buttons = document.querySelectorAll('.quiz-answer-btn');
            buttons.forEach((btn, index) => {
                btn.classList.toggle('selected', index === answerIndex);
            });

            // Enable next button
            const nextBtn = document.querySelector('[data-quiz-next]');
            if (nextBtn) {
                nextBtn.disabled = false;
            }

            // Save progress
            this.saveProgress();
        }

        nextQuestion() {
            if (this.currentQuestion < QUIZ_CONFIG.TOTAL_QUESTIONS - 1) {
                this.currentQuestion++;
                this.renderQuestion();
            } else {
                this.calculateResults();
            }
        }

        previousQuestion() {
            if (this.currentQuestion > 0) {
                this.currentQuestion--;
                this.renderQuestion();
            }
        }

        updateProgress() {
            const progress = ((this.currentQuestion + 1) / QUIZ_CONFIG.TOTAL_QUESTIONS) * 100;
            const progressFill = document.querySelector('.quiz-progress-fill');
            const progressText = document.querySelector('.quiz-progress-text');
            
            if (progressFill) {
                progressFill.style.width = `${progress}%`;
            }
            
            if (progressText) {
                progressText.textContent = `Question ${this.currentQuestion + 1} of ${QUIZ_CONFIG.TOTAL_QUESTIONS}`;
            }
        }

        calculateResults() {
            // Reset scores
            this.scores = {
                guardian: 0,
                warrior: 0,
                explorer: 0,
                rebuilder: 0
            };

            // Calculate scores based on answers
            this.answers.forEach((answerIndex, questionIndex) => {
                const question = QUIZ_QUESTIONS[questionIndex];
                const answer = question.answers[answerIndex];
                
                Object.keys(answer.points).forEach(profile => {
                    this.scores[profile] += answer.points[profile];
                });
            });

            // Determine profile
            const maxScore = Math.max(...Object.values(this.scores));
            const profileKey = Object.keys(this.scores).find(key => this.scores[key] === maxScore);
            this.profile = QUIZ_CONFIG.PROFILES[profileKey.toUpperCase()];

            // Calculate completion time
            const completionTime = Math.round((Date.now() - this.startTime) / 1000);

            // Track completion
            if (window.DentalSite && window.DentalSite.Analytics) {
                window.DentalSite.Analytics.track('Quiz Completed', {
                    profile: this.profile.name,
                    completionTime: completionTime,
                    scores: this.scores
                });
            }

            this.showResults();
        }

        showResults() {
            const quizBody = document.querySelector('.quiz-body');
            const quizFooter = document.querySelector('.quiz-footer');
            
            if (!quizBody || !this.profile) return;

            quizBody.innerHTML = `
                <div class="quiz-results">
                    <div class="quiz-profile-badge" style="background-color: ${this.profile.color}">
                        <span class="quiz-profile-icon">${this.profile.icon}</span>
                    </div>
                    <h3>Your Dental Health Profile:</h3>
                    <h2 class="quiz-profile-name" style="color: ${this.profile.color}">${this.profile.name}</h2>
                    <p class="quiz-profile-description">${this.profile.description}</p>
                    
                    <div class="quiz-recommendations">
                        <h4>Recommended Services for You:</h4>
                        <ul>
                            ${this.profile.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="quiz-cta-section">
                        <h4>Get Your Personalized Treatment Plan</h4>
                        <form class="quiz-lead-form" data-validate="true" data-form-name="Quiz Results">
                            <div class="form-group">
                                <input type="email" 
                                       class="form-control" 
                                       placeholder="Enter your email" 
                                       required 
                                       aria-label="Email address">
                            </div>
                            <button type="submit" class="btn btn-success btn-block">
                                Get My Free Consultation
                            </button>
                        </form>
                    </div>
                </div>
            `;

            if (quizFooter) {
                quizFooter.innerHTML = `
                    <button class="btn btn-outline" data-quiz-restart>Retake Quiz</button>
                    <button class="btn btn-primary" onclick="window.location.href='/pages/book-appointment.html'">
                        Book Appointment
                    </button>
                `;
            }

            // Save profile to storage
            this.saveProfile();

            // Initialize form handler for the lead form
            if (window.DentalSite && window.DentalSite.FormHandler) {
                const leadForm = document.querySelector('.quiz-lead-form');
                if (leadForm) {
                    window.DentalSite.FormHandler.setupForm(leadForm);
                }
            }
        }

        saveProgress() {
            const progress = {
                currentQuestion: this.currentQuestion,
                answers: this.answers,
                startTime: this.startTime
            };
            localStorage.setItem('dentalQuizProgress', JSON.stringify(progress));
        }

        loadProgress() {
            const saved = localStorage.getItem('dentalQuizProgress');
            if (saved) {
                try {
                    const progress = JSON.parse(saved);
                    // Only restore if quiz was started less than 30 minutes ago
                    if (progress.startTime && (Date.now() - progress.startTime) < 30 * 60 * 1000) {
                        this.currentQuestion = progress.currentQuestion || 0;
                        this.answers = progress.answers || [];
                        this.startTime = progress.startTime;
                    } else {
                        localStorage.removeItem('dentalQuizProgress');
                    }
                } catch (e) {
                    console.error('Error loading quiz progress:', e);
                }
            }
        }

        saveProfile() {
            if (this.profile) {
                const profileData = {
                    profile: this.profile,
                    scores: this.scores,
                    completedAt: Date.now()
                };
                localStorage.setItem('dentalQuizProfile', JSON.stringify(profileData));
                
                // Also save to cookie for server-side access
                if (window.DentalSite && window.DentalSite.Utils) {
                    window.DentalSite.Utils.setCookie('dental_profile', this.profile.id, 30);
                }
            }
        }

        getProfile() {
            const saved = localStorage.getItem('dentalQuizProfile');
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    // Profile expires after 30 days
                    if (data.completedAt && (Date.now() - data.completedAt) < 30 * 24 * 60 * 60 * 1000) {
                        return data.profile;
                    }
                } catch (e) {
                    console.error('Error loading quiz profile:', e);
                }
            }
            return null;
        }

        restart() {
            this.currentQuestion = 0;
            this.answers = [];
            this.scores = {
                guardian: 0,
                warrior: 0,
                explorer: 0,
                rebuilder: 0
            };
            this.profile = null;
            this.startTime = Date.now();
            
            localStorage.removeItem('dentalQuizProgress');
            this.renderQuestion();
        }

        close() {
            const modal = document.getElementById('quiz-modal');
            if (modal) {
                modal.classList.remove('open');
                setTimeout(() => modal.remove(), 300);
            }
            this.isActive = false;
        }
    }

    // Initialize quiz when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        window.dentalQuiz = new DentalQuiz();
        window.dentalQuiz.init();
    });

    // Add quiz styles
    const style = document.createElement('style');
    style.textContent = `
        /* Quiz Widget Styles */
        .quiz-widget {
            position: fixed;
            bottom: 100px;
            right: 30px;
            z-index: 998;
        }
        
        .quiz-widget-toggle {
            background: var(--accent-teal);
            color: white;
            border: none;
            border-radius: 50px;
            padding: 1rem 1.5rem;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            box-shadow: 0 4px 20px rgba(0, 168, 168, 0.4);
            transition: all 0.3s ease;
        }
        
        .quiz-widget-toggle:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 25px rgba(0, 168, 168, 0.5);
        }
        
        .quiz-widget-icon {
            font-size: 1.25rem;
        }
        
        /* Quiz Modal Styles */
        .quiz-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        
        .quiz-modal.open {
            opacity: 1;
            visibility: visible;
        }
        
        .quiz-modal-content {
            background: white;
            border-radius: 12px;
            width: 90%;
            max-width: 600px;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            animation: slideInUp 0.3s ease;
        }
        
        .quiz-close {
            position: absolute;
            top: 15px;
            right: 15px;
            background: none;
            border: none;
            font-size: 2rem;
            cursor: pointer;
            color: #999;
            transition: color 0.2s ease;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .quiz-close:hover {
            color: #333;
        }
        
        .quiz-header {
            padding: 2rem;
            border-bottom: 1px solid #eee;
        }
        
        .quiz-header h2 {
            margin-bottom: 1rem;
            color: var(--trust-blue);
        }
        
        .quiz-progress {
            margin-top: 1rem;
        }
        
        .quiz-progress-bar {
            height: 8px;
            background: #eee;
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 0.5rem;
        }
        
        .quiz-progress-fill {
            height: 100%;
            background: var(--accent-teal);
            transition: width 0.3s ease;
        }
        
        .quiz-progress-text {
            font-size: 0.875rem;
            color: #666;
        }
        
        .quiz-body {
            padding: 2rem;
            min-height: 300px;
        }
        
        .quiz-question h3 {
            margin-bottom: 1.5rem;
            font-size: 1.25rem;
        }
        
        .quiz-answers {
            display: grid;
            gap: 0.75rem;
        }
        
        .quiz-answer-btn {
            background: #f8f9fa;
            border: 2px solid #e9ecef;
            padding: 1rem 1.5rem;
            text-align: left;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 1rem;
        }
        
        .quiz-answer-btn:hover {
            background: #e9ecef;
            border-color: #ddd;
        }
        
        .quiz-answer-btn.selected {
            background: var(--trust-blue);
            color: white;
            border-color: var(--trust-blue);
        }
        
        .quiz-footer {
            padding: 1.5rem 2rem;
            border-top: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            gap: 1rem;
        }
        
        /* Quiz Results Styles */
        .quiz-results {
            text-align: center;
        }
        
        .quiz-profile-badge {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            color: white;
        }
        
        .quiz-profile-icon {
            font-size: 3rem;
        }
        
        .quiz-profile-name {
            margin: 1rem 0;
        }
        
        .quiz-profile-description {
            font-size: 1.125rem;
            margin-bottom: 2rem;
            color: #666;
        }
        
        .quiz-recommendations {
            background: #f8f9fa;
            padding: 1.5rem;
            border-radius: 8px;
            margin-bottom: 2rem;
            text-align: left;
        }
        
        .quiz-recommendations h4 {
            margin-bottom: 1rem;
            color: var(--trust-blue);
        }
        
        .quiz-recommendations ul {
            list-style: none;
            padding: 0;
        }
        
        .quiz-recommendations li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
        }
        
        .quiz-recommendations li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: var(--success-green);
            font-weight: bold;
        }
        
        .quiz-cta-section {
            background: linear-gradient(135deg, var(--trust-blue) 0%, var(--accent-teal) 100%);
            color: white;
            padding: 2rem;
            border-radius: 8px;
            margin-top: 2rem;
        }
        
        .quiz-cta-section h4 {
            color: white;
            margin-bottom: 1rem;
        }
        
        .quiz-lead-form {
            max-width: 400px;
            margin: 0 auto;
        }
        
        .btn-block {
            width: 100%;
        }
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
            .quiz-widget {
                bottom: 70px;
                right: 20px;
            }
            
            .quiz-widget-toggle {
                padding: 0.75rem 1.25rem;
                font-size: 0.875rem;
            }
            
            .quiz-modal-content {
                width: 95%;
                max-height: 95vh;
                margin: 10px;
            }
            
            .quiz-header,
            .quiz-body,
            .quiz-footer {
                padding: 1.25rem;
            }
            
            .quiz-answer-btn {
                padding: 0.875rem 1.25rem;
                font-size: 0.9375rem;
            }
        }
    `;
    document.head.appendChild(style);

})();