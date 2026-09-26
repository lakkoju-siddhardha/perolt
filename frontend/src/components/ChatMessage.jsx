import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import SourceCard from './SourceCard.jsx';
import LoadingIndicator from './LoadingIndicator.jsx';

import 'katex/dist/katex.min.css';
import './ChatMessage.css';


export default function ChatMessage({
  role,
  content,
  sources,
  pending,
  error
}) {

  const isUser = role === 'user';

  return (
    <div className={'chat-msg' + (isUser ? ' chat-msg--user' : '')}>

      <span className="chat-msg__avatar" aria-hidden="true">
        {isUser ? 'S' : <IconMark />}
      </span>

      <div className="chat-msg__content">

        <span className="chat-msg__author">
          {isUser ? 'You' : 'Perolt'}
        </span>


        {pending ? (

          <div className="chat-msg__bubble chat-msg__bubble--pending">
            <LoadingIndicator
              variant="dots"
              label="Reading your documents"
            />
          </div>

        ) : error ? (

          <div className="chat-msg__bubble chat-msg__bubble--error">
            {content}
          </div>

        ) : (

          <div className="chat-msg__bubble chat-msg__bubble--markdown">

            <ReactMarkdown
              remarkPlugins={[
                remarkGfm,
                remarkMath
              ]}
              rehypePlugins={[
                rehypeKatex
              ]}
            >
              {content}
            </ReactMarkdown>

          </div>

        )}


        {!pending && !error && sources && sources.length > 0 && (

          <div className="chat-msg__sources">

            <span className="chat-msg__sources-label">
              Sources
            </span>

            <div className="chat-msg__sources-grid">

              {sources.map((source, i) => (

                <SourceCard
                  key={source.chunkId ?? i}
                  index={i + 1}
                  source={source}
                />

              ))}

            </div>

          </div>

        )}

      </div>

    </div>
  );
}


function IconMark() {

  return (

    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
    >

      <path
        d="M5 3.5h10.5L19 7v13.5H5V3.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      <path
        d="M15.2 3.5V7H19"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

    </svg>

  );
}