"use client"
import React, { useEffect, useState, useCallback } from 'react'
import DocDisplayZone from '../_components/docDisplayZone/DocDisplayZone';
import SideBar from '../_components/sideBarZone/SideBar';
import ChatLLMZone from '../_components/llm/ChatLLMZone';
import FooterZone from '../_components/footerZone/FooterZone';


export default function Page() {

    const MENU_SIZE_DEFAULT = 180
    // CSS
    const [menuWidth, setmenuWidth] = useState(MENU_SIZE_DEFAULT)
    const [docViewerWidth, setDocViewerWidth] = useState(0)
    const [chatZoneWidth, setChatZoneWidth] = useState(0)

    // resize left
    const [isResizing, setIsResizing] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // resize right
    const [isResizingBis, setIsResizingBis] = useState(false);
    const [mousePositionBis, setMousePositionBis] = useState({ x: 0, y: 0 });

    // File to display
    const [fileToDisplay, setFileToDisplay] = useState<string>('')
    const [pageToDisplay, setPageToDisplay] = useState<number>(0)
    const [userFolderResult, setUserFolderResult] = useState(null);

    // ICI IL FAUT IMPLEMENTER LA LOGIQUE LORSQUE L'UTILISATEUR CHANGE LA TAILLE DE SON NAVIGATEUR
    useEffect(() => {
        // Handler to call on window resize
        function handleResize() {
          // Set window width/height to state
          const availableWidth = window.innerWidth - MENU_SIZE_DEFAULT;

          setChatZoneWidth((availableWidth / 2))
          setDocViewerWidth((availableWidth / 2))
    
        }
        
        // Add event listener
        window.addEventListener('resize', handleResize);
        
        // Call handler right away so state gets updated with initial window size
        handleResize();
    
        // Remove event listener on cleanup
        return () => window.removeEventListener('resize', handleResize);
      }, []);


    const disableTextSelection = useCallback(() => {
        document.body.style.userSelect = 'none';
    }, []);

    const enableTextSelection = useCallback(() => {
        document.body.style.userSelect = '';
    }, []);

    // 1. resizing fileNav
    const startResizing = useCallback((mouseDownEvent: React.MouseEvent<HTMLDivElement>) => {
        setIsResizing(true);
        setMousePosition({
            x: mouseDownEvent.clientX,
            y: mouseDownEvent.clientY,
        });
    }, []);

    const stopResizing = () => {
        setIsResizing(false);
    };

    const resize = (mouseMoveEvent: MouseEvent) => {
        if (isResizing) {
            const dx = mouseMoveEvent.clientX - mousePosition.x;

            if (menuWidth + dx < 50) {
                setmenuWidth(50)
                const menuWidth = 50
                setDocViewerWidth(window.innerWidth - chatZoneWidth - menuWidth)
            } else if (menuWidth + dx > 500) {
                setmenuWidth(500)
                const menuWidth = 500
                setDocViewerWidth(window.innerWidth - chatZoneWidth - menuWidth)
            } else {
                setmenuWidth((prevSize) => (prevSize + dx));
                setDocViewerWidth(window.innerWidth - chatZoneWidth - (menuWidth + dx))
            }
            setMousePosition({
                x: mouseMoveEvent.clientX,
                y: mouseMoveEvent.clientY,
            });
        }
    };

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', resize);
            window.addEventListener('mouseup', stopResizing);
        } else {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        }

        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [isResizing, mousePosition]);

    // 2. resizing docViewer

    const stopResizingBis = () => {
        setIsResizingBis(false);
    };

    const resizeBis = (mouseMoveEvent: MouseEvent) => {

        if (isResizingBis) {
            const dx = mouseMoveEvent.clientX - mousePositionBis.x;


            if (docViewerWidth + dx < 250) {
                setDocViewerWidth(250)
                const minDocViewerWidth = 250
                setChatZoneWidth(window.innerWidth - minDocViewerWidth - menuWidth)
            } else if (docViewerWidth + dx > ((window.innerWidth - 250) / 2)) {
                setDocViewerWidth(((window.innerWidth - 250) / 2))
                const maxDocViewerWidth = ((window.innerWidth - 250) / 2)
                setChatZoneWidth(window.innerWidth - maxDocViewerWidth - menuWidth)
            } else {
                setDocViewerWidth((prevSize) => (prevSize + dx));
                setChatZoneWidth(chatZoneWidth - dx)
            }

            setMousePositionBis({
                x: mouseMoveEvent.clientX,
                y: mouseMoveEvent.clientY,
            });
        }
    };

    useEffect(() => {
        if (isResizingBis) {
            window.addEventListener('mousemove', resizeBis);
            window.addEventListener('mouseup', stopResizingBis);
        } else {
            window.removeEventListener('mousemove', resizeBis);
            window.removeEventListener('mouseup', stopResizingBis);
        }

        return () => {
            window.removeEventListener('mousemove', resizeBis);
            window.removeEventListener('mouseup', stopResizingBis);
        };
    }, [isResizingBis, mousePositionBis]);

    const startResizingBis = useCallback((mouseDownEvent: React.MouseEvent<HTMLDivElement>) => {
        setIsResizingBis(true);
        setMousePositionBis({
            x: mouseDownEvent.clientX,
            y: mouseDownEvent.clientY,
        });
    }, []);

    const handleMouseDown = useCallback((e) => {
        e.stopPropagation();
        disableTextSelection();
        startResizing(e);
        // Use a cleanup function to re-enable text selection when the mouse is released
        const handleMouseUp = () => {
            enableTextSelection();
            document.removeEventListener('mouseup', handleMouseUp);
        };
        document.addEventListener('mouseup', handleMouseUp);
    }, [disableTextSelection, enableTextSelection, startResizing]);

    const handleMouseDownBis = useCallback((e) => {
        e.stopPropagation();
        disableTextSelection();
        startResizingBis(e);
        // Use a cleanup function to re-enable text selection when the mouse is released
        const handleMouseUp = () => {
            enableTextSelection();
            document.removeEventListener('mouseup', handleMouseUp);
        };
        document.addEventListener('mouseup', handleMouseUp);
    }, [disableTextSelection, enableTextSelection, startResizingBis]);


useEffect(() => {

    const handleSetDocs = (() => {

           //Delay scrolling until the element is likely to be loaded
            const timer = setTimeout(() => {
                
                
                const element = document.getElementById("lolo");
                console.log('element\n', element);


                if(element) {
                    const elementsArray = document.querySelectorAll('.react-pdf__Page');
                    console.log('elementsArray\n', elementsArray);
                    const targetPage = elementsArray[pageToDisplay - 1]; // Adjusting for 0-indexed array
                    console.log('targetPage\n', targetPage);

                    
                    if (targetPage) {
                      targetPage.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                
            }, 0); // Delay for X milliseconds (1 second)
        
            return () => clearTimeout(timer); // Cleanup the timer

        })

    handleSetDocs();


}, [pageToDisplay])

  
    return (
        <>
            <SideBar  menuWidth={menuWidth} handleMouseDown={handleMouseDown}/>
            <DocDisplayZone fileToDisplay={fileToDisplay} setFileToDisplay={setFileToDisplay} setPageToDisplay={setPageToDisplay} docViewerWidth={docViewerWidth} handleMouseDown={handleMouseDown} setUserFolderResult={setUserFolderResult}/>
            <ChatLLMZone chatZoneWidth={chatZoneWidth} setFileToDisplay={setFileToDisplay} setPageToDisplay={setPageToDisplay} fileToDisplay={fileToDisplay} handleMouseDownBis={handleMouseDownBis} userFolderResult={userFolderResult}/>
        </>
    )
}

/*

*/