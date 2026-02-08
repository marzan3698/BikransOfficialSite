import { useState, useEffect, useRef } from 'react'
import { authApi, publicApi } from '../services/api'
import './ChatRegister.css'

function ChatRegister({ onNavigateToLogin, onRegisterSuccess }) {
    const [messages, setMessages] = useState([])
    const [isTyping, setIsTyping] = useState(false)
    const [currentStep, setCurrentStep] = useState('0') // Start step
    const [userData, setUserData] = useState({
        name: '',
        phone: '',
        login_pin: '',
        whatsapp_number: '',
        gender: '',
        reference_id: '',
        project_id: '',
    })
    const [userInput, setUserInput] = useState('')
    const [projects, setProjects] = useState([])
    const [selectedProject, setSelectedProject] = useState(null)
    const [mcqAnswers, setMcqAnswers] = useState([null, null, null])
    const [currentMcqIndex, setCurrentMcqIndex] = useState(0)
    const messagesEndRef = useRef(null)
    const hasStarted = useRef(false)

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isTyping])

    // Initial Welcome
    useEffect(() => {
        if (!hasStarted.current) {
            hasStarted.current = true
            startConversation()
        }
    }, [])

    const startConversation = async () => {
        await addBotMessage('👋 হ্যালো! বিক্রান্সে আপনাকে স্বাগতম!')
        await addBotMessage('আমি আপনাকে নিবন্ধন প্রক্রিয়ায় সাহায্য করব। এটি খুব সহজ এবং মাত্র কয়েক মিনিট সময় নেবে। 😊')

        // Fetch projects first
        try {
            setIsTyping(true)
            const projs = await publicApi.getProjects()
            setProjects(projs)
            setIsTyping(false)

            if (projs.length > 0) {
                await addBotMessage('প্রথমে আপনি কোন প্রজেক্টের অধীনে নিবন্ধন করতে চান তা নির্বাচন করুন 👇')
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    sender: 'bot',
                    type: 'options',
                    options: projs.map(p => ({ label: `${p.name} (${p.code})`, value: p.code }))
                }])
                setCurrentStep('project')
            } else {
                await addBotMessage('দুঃখিত, বর্তমানে কোনো প্রজেক্ট পাওয়া যাচ্ছে না।')
                await addBotMessage('দয়া করে আপনার প্রজেক্ট কোডটি টাইপ করুন।')
                setCurrentStep('project_manual')
            }

        } catch (err) {
            setIsTyping(false)
            console.error(err)
            await addBotMessage('প্রজেক্ট লোড করতে সমস্যা হচ্ছে। দয়া করে আপনার প্রজেক্ট কোডটি টাইপ করুন।')
            setCurrentStep('project_manual')
        }
    }

    const addBotMessage = (text, delay = 1000) => {
        return new Promise((resolve) => {
            setIsTyping(true)
            setTimeout(() => {
                setMessages((prev) => [
                    ...prev,
                    { id: Date.now(), text, sender: 'bot', type: 'text' },
                ])
                setIsTyping(false)
                resolve()
            }, delay)
        })
    }

    const addUserMessage = (text) => {
        setMessages((prev) => [
            ...prev,
            { id: Date.now(), text, sender: 'user', type: 'text' },
        ])
    }

    const handleSendMessage = async () => {
        if (!userInput.trim() && currentStep !== 'reference') return

        const input = userInput.trim()
        addUserMessage(input)
        setUserInput('')
        processInput(input)
    }

    const handleOptionSelect = (value, label) => {
        addUserMessage(label || value)
        processInput(value)
    }

    // Extract YouTube video ID from URL
    const extractYouTubeId = (url) => {
        if (!url) return null
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/)
        return match ? match[1] : null
    }

    // Check MCQ answer
    const checkMcqAnswer = (selectedAnswer, correctAnswer) => {
        return selectedAnswer.toLowerCase() === correctAnswer.toLowerCase()
    }

    const processInput = async (input) => {
        switch (currentStep) {
            case 'project':
            case 'project_manual':
                // Find selected project
                const proj = projects.find(p => p.code === input)
                if (proj) {
                    setSelectedProject(proj)
                    setUserData({ ...userData, project_code: input })

                    // Check if project has YouTube video and MCQ
                    if (proj.youtube_url) {
                        const videoId = extractYouTubeId(proj.youtube_url)

                        await addBotMessage(`আপনি "${proj.name}" প্রজেক্ট নির্বাচন করেছেন। ✅`)

                        // Show video instruction message
                        await addBotMessage('অনুগ্রহ করে প্রজেক্টে জয়েন করার আগে এই ভিডিওটি সম্পূর্ণ দেখুন। দেখা শেষ হয়ে গেলে নিচের ৩টি প্রশ্নের উত্তর দিন। সঠিক উত্তর দিলেই আপনি নিবন্ধন করার যোগ্য বলে বিবেচিত হবেন। প্রজেক্টে জয়েন করার আগে আপনাকে প্রজেক্ট সম্পর্কে গুরুত্বপূর্ণ তথ্য জানানোই আমাদের উদ্দেশ্য। 📹')

                        // Add YouTube video embed message
                        setMessages(prev => [...prev, {
                            id: Date.now() + 1,
                            sender: 'bot',
                            type: 'video',
                            videoId: videoId,
                            videoUrl: proj.youtube_url
                        }])

                        // Add button to proceed to MCQ
                        setTimeout(() => {
                            setMessages(prev => [...prev, {
                                id: Date.now() + 2,
                                sender: 'bot',
                                type: 'options',
                                options: [{ label: '✅ ভিডিও দেখেছি, এখন প্রশ্ন করুন', value: 'video_watched' }]
                            }])
                        }, 1500)

                        setCurrentStep('video')
                    } else {
                        // No video, proceed to registration
                        await addBotMessage(`আপনি "${proj.name}" প্রজেক্ট নির্বাচন করেছেন। ✅`)
                        await addBotMessage('চলুন শুরু করা যাক! আপনার পুরো নাম কি?')
                        setCurrentStep('name')
                    }
                } else {
                    // Manual input
                    setUserData({ ...userData, project_code: input })
                    await addBotMessage('প্রজেক্ট কোড নোট করা হয়েছে। ✅')
                    await addBotMessage('চলুন শুরু করা যাক! আপনার পুরো নাম কি?')
                    setCurrentStep('name')
                }
                break

            case 'video':
                if (input === 'video_watched') {
                    // Parse MCQ data
                    let mcqData = []
                    try {
                        mcqData = selectedProject.mcq_data ? JSON.parse(selectedProject.mcq_data) : []
                    } catch (e) {
                        mcqData = []
                    }

                    if (mcqData.length > 0) {
                        setCurrentMcqIndex(0)
                        await showMcqQuestion(mcqData[0], 0)
                        setCurrentStep('mcq')
                    } else {
                        await addBotMessage('চলুন শুরু করা যাক! আপনার পুরো নাম কি?')
                        setCurrentStep('name')
                    }
                }
                break

            case 'mcq':
                // Check answer
                let mcqData = []
                try {
                    mcqData = selectedProject.mcq_data ? JSON.parse(selectedProject.mcq_data) : []
                } catch (e) {
                    mcqData = []
                }

                const currentMcq = mcqData[currentMcqIndex]
                if (currentMcq && checkMcqAnswer(input, currentMcq.answer)) {
                    // Correct answer
                    const newAnswers = [...mcqAnswers]
                    newAnswers[currentMcqIndex] = input
                    setMcqAnswers(newAnswers)

                    await addBotMessage('সঠিক উত্তর! ✅')

                    // Move to next MCQ or proceed to registration
                    const nextIndex = currentMcqIndex + 1
                    if (nextIndex < mcqData.length) {
                        setCurrentMcqIndex(nextIndex)
                        await showMcqQuestion(mcqData[nextIndex], nextIndex)
                    } else {
                        // All MCQ answered correctly
                        await addBotMessage('অভিনন্দন! 🎉 আপনি সকল প্রশ্নের সঠিক উত্তর দিয়েছেন।')
                        await addBotMessage('এখন আপনি নিবন্ধন করতে পারবেন। চলুন শুরু করা যাক! আপনার পুরো নাম কি?')
                        setCurrentStep('name')
                    }
                } else {
                    // Wrong answer
                    await addBotMessage('দুঃখিত, উত্তরটি সঠিক নয়। ❌')
                    await addBotMessage('অনুগ্রহ করে ভিডিওটি আবার মনোযোগ দিয়ে দেখুন এবং পুনরায় চেষ্টা করুন।')

                    // Reset and go back to video
                    setMcqAnswers([null, null, null])
                    setCurrentMcqIndex(0)

                    setMessages(prev => [...prev, {
                        id: Date.now() + 1,
                        sender: 'bot',
                        type: 'options',
                        options: [{ label: '🔄 পুনরায় চেষ্টা করুন', value: 'retry_mcq' }]
                    }])
                    setCurrentStep('mcq_retry')
                }
                break

            case 'mcq_retry':
                if (input === 'retry_mcq') {
                    // Show video again
                    const videoId = extractYouTubeId(selectedProject.youtube_url)

                    await addBotMessage('অনুগ্রহ করে ভিডিওটি আবার দেখুন এবং প্রশ্নের উত্তর দিন। 📹')

                    setMessages(prev => [...prev, {
                        id: Date.now() + 1,
                        sender: 'bot',
                        type: 'video',
                        videoId: videoId,
                        videoUrl: selectedProject.youtube_url
                    }])

                    setTimeout(() => {
                        setMessages(prev => [...prev, {
                            id: Date.now() + 2,
                            sender: 'bot',
                            type: 'options',
                            options: [{ label: '✅ ভিডিও দেখেছি, এখন প্রশ্ন করুন', value: 'video_watched' }]
                        }])
                    }, 1500)

                    setCurrentStep('video')
                }
                break

            case 'name':
                if (input.length < 3) {
                    await addBotMessage('নামটি খুব ছোট মনে হচ্ছে। দয়া করে আপনার পুরো নাম লিখুন।')
                    return
                }
                setUserData({ ...userData, name: input })
                await addBotMessage(`ধন্যবাদ ${input}! আপনার সাথে পরিচিত হয়ে ভালো লাগল। 🤝`)
                await addBotMessage('এখন আমাদের আপনার মোবাইল নম্বর প্রয়োজন।')
                await addBotMessage('এটি আপনার ইউজার আইডি হিসেবে ব্যবহৃত হবে এবং আমরা লগইন করার জন্য এটি ব্যবহার করব। আপনার ১১ ডিজিটের মোবাইল নম্বরটি লিখুন।')
                setCurrentStep('phone')
                break

            case 'phone':
                const phoneRegex = /^01[3-9]\d{8}$/
                if (!phoneRegex.test(input)) {
                    await addBotMessage('ওহ! নম্বরটি সঠিক মনে হচ্ছে না। 😕 দয়া করে সঠিক ১১ ডিজিটের বাংলাদেশী মোবাইল নম্বর দিন (যেমন: 01712345678)।')
                    return
                }

                // Check if phone exists
                setIsTyping(true)
                try {
                    const { exists } = await authApi.checkPhone(input)
                    setIsTyping(false)

                    if (exists) {
                        await addBotMessage('এই নম্বরটি দিয়ে ইতিমধ্যেই একটি অ্যাকাউন্ট খোলা আছে। ⚠️')
                        await addBotMessage('দুঃখিত, আপনি এই নম্বর দিয়ে নতুন অ্যাকাউন্ট খুলতে পারবেন না। অনুগ্রহ করে লগইন করুন।')
                        return
                    }
                } catch (err) {
                    setIsTyping(false)
                    console.error('Phone check failed:', err)
                }

                setUserData({ ...userData, phone: input })
                await addBotMessage('দারুণ! নম্বরটি সেভ করা হয়েছে। ✅')
                await addBotMessage('আপনার অ্যাকাউন্টের নিরাপত্তার জন্য একটি ৬ সংখ্যার গোপন পিন সেট করুন।')
                await addBotMessage('এই পিনটি মনে রাখবেন, কারণ লগইন করার সময় এটি প্রয়োজন হবে।')
                setCurrentStep('pin')
                break

            case 'pin':
                if (!/^\d{6}$/.test(input)) {
                    await addBotMessage('পিনটি অবশ্যই ৬ সংখ্যার হতে হবে। দয়া করে আবার চেষ্টা করুন।')
                    return
                }
                setUserData({ ...userData, login_pin: input })
                await addBotMessage('পিন সেট করা হয়েছে! 🔒')
                await addBotMessage('আমরা কি আপনার হোয়াটসঅ্যাপ নম্বরটি পেতে পারি? জরুরি প্রয়োজনে আমরা যোগাযোগ করতে পারব।')
                setCurrentStep('whatsapp')
                break

            case 'whatsapp':
                const waRegex = /^01[3-9]\d{8}$/
                if (!waRegex.test(input)) {
                    await addBotMessage('হোয়াটসঅ্যাপ নম্বরটিও ১১ ডিজিটের হওয়া উচিত। দয়া করে চেক করে আবার দিন।')
                    return
                }
                setUserData({ ...userData, whatsapp_number: input })
                await addBotMessage('ধন্যবাদ! 😊')
                await addBotMessage('আপনার লিঙ্গ নির্বাচন করুন 👇')
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    sender: 'bot',
                    type: 'options',
                    options: [
                        { label: 'পুরুষ', value: 'Male' },
                        { label: 'মহিলা', value: 'Female' },
                        { label: 'অন্যান্য', value: 'Other' }
                    ]
                }])
                setCurrentStep('gender')
                break

            case 'gender':
                setUserData({ ...userData, gender: input })
                await addBotMessage('ঠিক আছে।')
                await addBotMessage('আপনাকে কি কেউ রেফার করেছে? যদি রেফারেন্স থাকে তবে তার আইডি বা মোবাইল নম্বর দিন। না থাকলে "skip" লিখুন বা স্কিপ বাটনে ক্লিক করুন।')
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    sender: 'bot',
                    type: 'options',
                    options: [
                        { label: 'স্কিপ করুন', value: 'skip' }
                    ]
                }])
                setCurrentStep('reference')
                break

            case 'reference':
                if (input.toLowerCase() !== 'skip') {
                    setUserData({ ...userData, reference_id: input })
                    await addBotMessage('রেফারেন্স নোট করা হয়েছে।')
                } else {
                    await addBotMessage('আচ্ছা, কোনো সমস্যা নেই।')
                }

                // Submit registration
                const finalData = {
                    ...userData,
                    reference_id: input.toLowerCase() !== 'skip' ? input : userData.reference_id
                }
                await submitRegistration(finalData)
                break

            default:
                break
        }
    }

    const showMcqQuestion = async (mcq, index) => {
        await addBotMessage(`প্রশ্ন ${index + 1}: ${mcq.question}`)

        // Show options as buttons
        setMessages(prev => [...prev, {
            id: Date.now() + 1,
            sender: 'bot',
            type: 'mcq',
            options: [
                { label: `ক) ${mcq.optionA}`, value: 'a' },
                { label: `খ) ${mcq.optionB}`, value: 'b' },
                { label: `গ) ${mcq.optionC}`, value: 'c' },
                { label: `ঘ) ${mcq.optionD}`, value: 'd' }
            ]
        }])
    }

    const submitRegistration = async (finalData) => {
        await addBotMessage('আপনার তথ্য যাচাই করা হচ্ছে... ⏳')

        try {
            const payload = {
                name: finalData.name,
                phone: finalData.phone,
                password: finalData.login_pin,
                whatsapp_number: finalData.whatsapp_number,
                gender: finalData.gender,
                reference_id: finalData.reference_id,
                project_code: finalData.project_code || finalData.project_id
            }

            const res = await authApi.register(payload)

            await addBotMessage('অভিনন্দন! 🎉 আপনার নিবন্ধন সফল হয়েছে।')
            await addBotMessage('আপনাকে ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে...')

            setTimeout(() => {
                onRegisterSuccess && onRegisterSuccess(res.user)
                if (res.token) {
                    localStorage.setItem('bikrans_token', res.token)
                    window.location.reload()
                } else {
                    onNavigateToLogin()
                }
            }, 2000)

        } catch (err) {
            console.error(err)
            await addBotMessage(`দুঃখিত, নিবন্ধন সম্পন্ন করা যায়নি। ❌ কারন: ${err.message}`)
            await addBotMessage('দয়া করে আবার চেষ্টা করুন বা অন্য মোবাইল নম্বর ব্যবহার করুন।')
            setCurrentStep('retry')
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'bot',
                type: 'options',
                options: [
                    { label: 'আবার চেষ্টা করুন', value: 'retry' }
                ]
            }])
        }
    }

    const handleRetry = () => {
        setUserData({
            name: '',
            phone: '',
            login_pin: '',
            whatsapp_number: '',
            gender: '',
            reference_id: '',
            project_id: '',
        })
        setSelectedProject(null)
        setMcqAnswers([null, null, null])
        setCurrentMcqIndex(0)
        setMessages([])
        hasStarted.current = false
        startConversation()
    }


    return (
        <div className="chat-register-container">
            <div className="chat-header">
                <button className="chat-header-back" onClick={onNavigateToLogin}>
                    ←
                </button>
                <div className="chat-header-info">
                    <img src="/BIKRANS-FINAL.png" alt="Bikrans Bot" className="chat-avatar" />
                    <div className="chat-bot-details">
                        <h3>Bikrans Assistant</h3>
                        <p className="chat-bot-status">Active now</p>
                    </div>
                </div>
            </div>

            <div className="chat-messages-area">
                {messages.map((msg) => (
                    <div key={msg.id} className={`message ${msg.sender}`}>
                        {msg.sender === 'bot' && msg.type === 'options' ? (
                            <div className="options-container">
                                {msg.options.map((opt, idx) => (
                                    <button key={idx} className="option-btn" onClick={() => handleOptionSelect(opt.value, opt.label)}>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        ) : msg.sender === 'bot' && msg.type === 'mcq' ? (
                            <div className="mcq-options-container">
                                {msg.options.map((opt, idx) => (
                                    <button key={idx} className="mcq-option-btn" onClick={() => handleOptionSelect(opt.value, opt.label)}>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        ) : msg.sender === 'bot' && msg.type === 'video' ? (
                            <div className="video-container">
                                <iframe
                                    width="100%"
                                    height="200"
                                    src={`https://www.youtube.com/embed/${msg.videoId}`}
                                    title="Project Video"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        ) : (
                            <>
                                {msg.text}
                                <span className="message-time">
                                    {new Date(msg.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </>
                        )}
                    </div>
                ))}

                {isTyping && (
                    <div className="typing-indicator">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
                {currentStep === 'retry' ? (
                    <button className="btn-login" onClick={handleRetry} style={{ width: 'auto', margin: '0 auto' }}>আবার শুরু করুন</button>
                ) : (
                    <>
                        <div className="chat-input-wrapper">
                            <input
                                type={currentStep === 'pin' ? 'password' : (currentStep === 'phone' || currentStep === 'whatsapp' ? 'tel' : 'text')}
                                className="chat-input"
                                placeholder={currentStep === 'gender' || currentStep === 'project' || currentStep === 'video' || currentStep === 'mcq' || currentStep === 'mcq_retry' ? 'অপশন নির্বাচন করুন...' : 'এখানে লিখুন...'}
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                disabled={currentStep === 'gender' || currentStep === 'project' || currentStep === 'retry' || currentStep === 'video' || currentStep === 'mcq' || currentStep === 'mcq_retry'}
                            />
                        </div>
                        <button
                            className="send-btn"
                            onClick={handleSendMessage}
                            disabled={!userInput.trim() && currentStep !== 'reference'}
                        >
                            ➤
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}

export default ChatRegister
