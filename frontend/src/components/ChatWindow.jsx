import { useEffect, useRef, useState } from 'react';
import ChatMessage from './ChatMessage.jsx';
import { askQuestion } from '../services/api.js';
import './ChatWindow.css';

let idCounter = 0;

const nextId = () => `m${++idCounter}`;

const MAX_QUESTION_LENGTH = 2000;

const suggestions = [
  'What is a proposition?',
  'Explain the contrapositive.',
  'What topics are covered in this document?',
  'Summarize the important concepts.'
];

export default function ChatWindow() {

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  /*
   * Keep the newest message visible.
   */
  useEffect(() => {

    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth'
    });

  }, [messages]);


  /*
   * Automatically resize the textarea.
   */
  useEffect(() => {

    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.style.height = 'auto';

    textarea.style.height =
      Math.min(textarea.scrollHeight, 180) + 'px';

  }, [input]);


  /*
   * Focus the input when Perolt finishes answering.
   */
  useEffect(() => {

    if (!busy) {
      textareaRef.current?.focus();
    }

  }, [busy]);


  const handleSubmit = async (event) => {

    event?.preventDefault();

    const question = input.trim();

    if (!question || busy) return;

    if (question.length > MAX_QUESTION_LENGTH) {
      return;
    }


    const userMsg = {
      id: nextId(),
      role: 'user',
      content: question
    };


    const pendingMsg = {
      id: nextId(),
      role: 'assistant',
      pending: true
    };


    setMessages((prev) => [
      ...prev,
      userMsg,
      pendingMsg
    ]);

    setInput('');
    setBusy(true);


 try {

  const conversation = messages
    .filter((message) => !message.pending && !message.error)
    .map((message) => ({
      role: message.role,
      content: message.content
    }));

  const result = await askQuestion(
    question,
    conversation
  );


  setMessages((prev) =>
        prev.map((message) =>

          message.id === pendingMsg.id

            ? {
                ...message,
                pending: false,
                content:
                  result.answer ||
                  'I could not generate an answer.',
                sources: result.sources || []
              }

            : message
        )
      );


    } catch (err) {

      setMessages((prev) =>
        prev.map((message) =>

          message.id === pendingMsg.id

            ? {
                ...message,
                pending: false,
                error: true,
                content:
                  err.message ||
                  'Something went wrong while answering your question.'
              }

            : message
        )
      );


    } finally {

      setBusy(false);

    }
  };


  const handleKeyDown = (event) => {

    /*
     * Enter → send
     * Shift + Enter → new line
     */

    if (
      event.key === 'Enter' &&
      !event.shiftKey
    ) {

      event.preventDefault();

      handleSubmit(event);
    }

  };


  const handleSuggestion = (question) => {

    if (busy) return;

    setInput(question);

    textareaRef.current?.focus();

  };


  return (

    <div className="chat-window">

      <div
        className="chat-window__scroll scroll-fade"
        ref={scrollRef}
      >

        {messages.length === 0 ? (

          <div className="chat-window__empty">

            <div className="chat-window__empty-icon">
              <IconSpark />
            </div>

            <h3>
              Ask Perolt anything
            </h3>

            <p>
              Perolt searches your uploaded PDFs,
              finds relevant passages, and explains
              the answer with sources.
            </p>


            <div className="chat-window__suggestions">

              {suggestions.map((question) => (

                <button
                  key={question}
                  type="button"
                  className="chat-window__suggestion"
                  onClick={() =>
                    handleSuggestion(question)
                  }
                  disabled={busy}
                >
                  {question}
                </button>

              ))}

            </div>

          </div>

        ) : (

          <div className="chat-window__messages">

            {messages.map((message) => (

              <ChatMessage
                key={message.id}
                {...message}
              />

            ))}

          </div>

        )}

      </div>


      <form
        className="chat-window__composer"
        onSubmit={handleSubmit}
      >

        <div className="chat-window__input-wrap">

          <textarea
            ref={textareaRef}
            className="chat-window__input"
            placeholder={
              busy
                ? 'Perolt is searching your documents...'
                : 'Ask a question about your documents...'
            }
            value={input}
            maxLength={MAX_QUESTION_LENGTH}
            onChange={(event) =>
              setInput(event.target.value)
            }
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={busy}
            aria-label="Ask Perolt a question"
          />

          {input.length > 0 && (

            <span
              className={
                'chat-window__counter' +
                (
                  input.length > 1800
                    ? ' chat-window__counter--warning'
                    : ''
                )
              }
            >
              {input.length}/{MAX_QUESTION_LENGTH}
            </span>

          )}

        </div>


        <button
          type="submit"
          className="chat-window__send"
          disabled={!input.trim() || busy}
          aria-label="Send question"
        >

          <IconSend />

        </button>

      </form>

    </div>
  );
}


/* Send icon */

function IconSend() {

  return (

    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
    >

      <path
        d="M4 12 20 4l-6.5 16-2.7-7L4 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

    </svg>
  );
}


/* Empty-state icon */

function IconSpark() {

  return (

    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >

      <path
        d="M12 2.8 13.7 9l6 2-6 2-1.7 6.2L10.3 13 4.3 11l6-2L12 2.8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      <path
        d="m19 3 .6 2.2L21.8 6 19.6 6.8 19 9l-.6-2.2-2.2-.8 2.2-.8L19 3Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />

    </svg>
  );
}