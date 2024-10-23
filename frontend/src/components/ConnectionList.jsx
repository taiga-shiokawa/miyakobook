import { useState } from 'react';
import UserCard from './UserCard';

const ConnectionList = ({ connections }) => {
  const [visibleCount, setVisibleCount] = useState(6); // 初期表示数
  const increment = 6; // 「もっと見る」を押した時に追加で表示する数

  const showMoreConnections = () => {
    setVisibleCount(prevCount => prevCount + increment);
  };

  return (
    <div className='mb-8'>
      <h2 className='text-xl font-semibold mb-4'>コネクション中</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {connections.data.slice(0, visibleCount).map((connection) => (
          <UserCard key={connection._id} user={connection} isConnection={true} />
        ))}
      </div>
      {visibleCount < connections.data.length && (
        <div className="text-center mt-4">
          <button 
            onClick={showMoreConnections}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            もっと見る
          </button>
        </div>
      )}
    </div>
  );
};

export default ConnectionList;