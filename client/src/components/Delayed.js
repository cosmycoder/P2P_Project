import React, { useState, useEffect } from 'react';
import { CircularProgress } from '@mui/material';
const Delayed = ({ children, loadingMessage, waitBeforeShow = 500}) => {
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShown(true);
    }, waitBeforeShow);
    return () => clearTimeout(timer);
  }, [waitBeforeShow]);

  return (
        <>
            {
                isShown ?
                children : (
                    <div className="grid grid-rows-2 gap-4">
                        <h1 className="text-center text-2xl text-black dark:text-white">{`${loadingMessage}`}</h1>
                        <CircularProgress className="m-auto p-2"/>
                    </div>
                )
            }
        </>
    );
};

export default Delayed;
