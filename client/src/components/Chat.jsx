import { useState, useEffect, useRef, use } from "react";

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

    useEffect
}