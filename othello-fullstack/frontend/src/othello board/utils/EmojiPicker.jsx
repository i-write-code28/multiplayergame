import { useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import "../css/side-options.css"
import { useEffect } from 'react';

const FloatingEmoji = ({ unified }) => {
  const [position, setPosition] = useState({
    x: Math.random() * 40 - 20, // Random initial horizontal position
    y: 0
  });

  useEffect(() => {
    const randomX = Math.random() * 100 - 50; // Random horizontal movement
    setPosition(prev => ({
      ...prev,
      x: randomX
    }));
  }, []);

  return (
    <div
      className="animate-float-emoji"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    >
      {String.fromCodePoint(parseInt(unified, 16))}
    </div>
  );
};

const EmojiPickerComponent = () => {
  const [emojiList, setEmojiList] = useState([]);  // Store emojis in state

  const handleReaction = (emoji) => {
    // Add emoji to state list
    setEmojiList(prevList => [...prevList, emoji.unified]);
    console.log(emojiList);
  };

  return (
    <div className='emoji-picker-container'>
      {emojiList.map((emoji, index) => (
        <FloatingEmoji key={index} unified={emoji} />
      ))}
      <EmojiPicker
       theme='dark'
       emojiStyle='google'
       lazyLoadEmojis={true}
       previewConfig={
        {
            showPreview: false
          }
       }
       allowExpandReactions={false}
       reactionsDefaultOpen={true}  
      onReactionClick={handleReaction}
      className='emoji-picker'
       />
    </div>
  );
};

export default EmojiPickerComponent;
