import { useState, useEffect, useRef } from "react";

export default function Chat({ socket }) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [unread, setUnread] = useState(0)
    const bottomRef = useRef(null)

    useEffect(() => {
        
        if(!socket) return 
        socket.on('chat:message', (msg) => {
            setMessages(prev => [ ...prev, msg])
            if(!isOpen) setUnread(prev => prev + 1)
        })
        return () => socket.off('chat:message')
    }, [socket, isOpen])

    useEffect(() => {
        if(!socket) return 
        socket.on('chat:delete', (id) => {
            setMessages(prev => prev.filter((_, i) => i != id))
        })
        return () => socket.off('chat:delete')
    }, [socket])

    useEffect(() => {
        if(isOpen) {
            setUnread(0)
            bottomRef.current?.scrollIntoView({behavior: 'smooth'})
        }
    }, [isOpen, messages])

    const sendMessage = () => {
        if(!input.trim() || !socket) return 
        socket.emit('chat:message', input.trim())
        setInput('')
    }

    const deleteMessage = (id) => {
        socket.emit('chat:delete', id)
    }

    const clearChat = () => {
        setMessages([])
    }

    const handleKey = (e) => {
        if(e.key == 'Enter') sendMessage()
    }

    return (
        <>
            {/* Toggle button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed right-4 bottom-4 z-50 bg-rose-200 hover:bg-rose-300 text-black font-bold w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all"
                >
                    <span className="relative">
                        ➤
                        {unread > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                {unread}
                            </span>
                        )}
                    </span>
                </button>
            )}

            {/* Panel */}
            <div className={`fixed right-0 top-0 h-full w-72 bg-zinc-900 border-l border-zinc-700 flex flex-col z-40 transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700">
                    <span className="font-bold tracking-widest text-rose-300 uppercase text-s">Chat</span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={clearChat}
                            className="text-zinc-500 hover:text-red-400 text-xs transition-colors"
                            title="Clear chat"
                        >
                            Clear 
                        </button>
                        <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition-colors">✕</button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
                {messages.length === 0 && (
                    <p className="text-zinc-600 text-xs text-center mt-4">No messages yet...</p>
                )}
                {messages.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.self ? 'items-end' : 'items-start'}`}>
                    <span className="text-zinc-500 text-xs mb-0.5">{msg.self ? 'You' : msg.userId}</span>
                        <div className="flex items-center gap-1">
                            {msg.self && (
                                <button
                                    onClick={() => deleteMessage(msg.id)}
                                    className="text-zinc-300 hover:text-red-400 text-sm transition-colors"
                                    title="Delete for everyone"
                                >
                                    🗑 
                                </button>
                            )}
                        
                            <span className={`px-3 py-1.5 rounded-2xl text-sm max-w-[85%] break-words ${
                                msg.self ? 'bg-rose-400 text-black' : 'bg-zinc-800 text-white'
                            }`}>
                                {msg.text}
                            </span>
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="px-4 py-3 border-t border-zinc-700 flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKey}
                        placeholder="..."
                        className="flex-1 bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 outline-none border border-zinc-700 focus:border-rose-400 transition-colors placeholder:text-zinc-600"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim()}
                        className="bg-rose-400 hover:bg-rose-300 text-black font-bold px-3 rounded-lg transition-colors"
                    >
                        ↑
                    </button>
                </div>
            </div>
        </>
    )
}