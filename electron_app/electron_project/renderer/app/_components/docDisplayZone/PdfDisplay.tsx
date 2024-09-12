'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import { useResizeObserver } from '@wojtekmaj/react-hooks';
import { pdfjs, Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import type { PDFDocumentProxy } from 'pdfjs-dist';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

const options = {
  cMapUrl: '/cmaps/',
  standardFontDataUrl: '/standard_fonts/',
};

const resizeObserverOptions = {};

const maxWidth = 800;

type PDFFile = string | File | null;


function PdfDisplay({ fileToDisplay, docViewerWidth, numPages, setNumPages, zoomLevel, setCurrentPage }) {
  
  const documentRef = useRef<HTMLDivElement>(null); // Create a ref for the document component
  const [fileToDisplayChecked, setFileToDisplayChecked] = useState('')


  function getFileName(filePath : string) {
    // Get the last portion of the path (in case it's a path)
    const baseName = filePath.split('/').pop();
    // Find the last dot where the extension starts
    const dotIndex = baseName?.lastIndexOf('.');
    // If there is no dot, return the whole name; otherwise, return the part before the dot
    if (!dotIndex)
        return baseName
    return dotIndex === -1 ? baseName : baseName?.substring(0, dotIndex);
}

function getFileExtension(filePath : string) {
    // Get the last portion of the path (in case it's a path)
    const baseName = filePath.split('/').pop();
    // Find the last dot where the extension starts
    const dotIndex = baseName?.lastIndexOf('.');
    // If there is no dot, return an empty string; otherwise, return the part after the dot
    if (!dotIndex)
        return baseName
    return dotIndex === -1 ? '' : baseName?.substring(dotIndex + 1);
}

  useEffect(() => {
    const REGEX_FOR_FILENAME = /[^\/]+\.(pdf|txt|png|jpg|jpeg|docx|doc)/g

    const REGEX_FOR_PATH = /^.*\//g

    const pathFromRegex = fileToDisplay.match(REGEX_FOR_PATH)
    console.log('pthFromRegex\n', pathFromRegex);
    
    const filenameFromRegex = fileToDisplay.match(REGEX_FOR_FILENAME)

    const extension = getFileExtension(fileToDisplay)
    const fileName = getFileName(fileToDisplay)

    if (extension === 'docx') {
      const fileDisplay = `${pathFromRegex[0]}/.${fileName}.pdf`
      console.log('fileDisplay\n', fileDisplay);
      setFileToDisplayChecked(fileDisplay)
    } else {
      setFileToDisplayChecked(fileToDisplay)
    }
    

  }, [fileToDisplay])
  
  const handleScroll = useCallback(() => {
    // Query the document for elements with the class 'react-pdf__Page'
    const pages = documentRef.current?.getElementsByClassName('react-pdf__Page');
    if (pages && pages.length > 1) {
      // Use type assertion to treat elements as HTMLElements
      const firstPage = pages[0] as HTMLElement;
      const secondPage = pages[1] as HTMLElement;
      
      // Calculate the height of a page by finding the distance between two consecutive pages
      const pageHeight = secondPage.offsetTop - firstPage.offsetTop;
      // console.log('pageHeight\n', pageHeight);
      
      var element = document.getElementById('lolo');

      if (!element) return;
  
      const { scrollTop } = element;      
      
      const newCurrentPage = Math.floor((scrollTop - (pageHeight * 0.75)) / pageHeight) + 2;
      // console.log('Math.floor((scrollTop - (pageHeight * 0.75)) / pageHeight)\n', Math.floor((scrollTop - (pageHeight * 0.75)) / pageHeight));
      // console.log(`newCurrentPage\n`, newCurrentPage);
      
      setCurrentPage(newCurrentPage <= numPages ? newCurrentPage : numPages); // Ensure the page number is within bounds
    }
  }, [numPages, setCurrentPage]);

  useEffect(() => {
    const div = documentRef.current;
    if (div) {
      div.addEventListener('scroll', handleScroll, { passive: true });
    }
    return () => {
      if (div) {
        div.removeEventListener('scroll', handleScroll);
      }
    };
  }, [handleScroll]);

  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages);
  }, []);

    return (
      <div
      id="lolo"
      onScroll={() => {handleScroll()}}
      style={{ width: `${docViewerWidth}px`, overflow: `overlay` }}
      className='relative h-[calc(100%-32px)] mt-[2px] border-1 border-black bg-[#202124] flex justify-center overflow-auto overflow-y-scroll scroll-p-0 scrollbar-thin scrollbar-rounded-lg scrollbar-thumb-[#858585] scrollbar-track-[#202124]'>    
      <div ref={documentRef}>
        <Document
          file={`file://${fileToDisplayChecked}`}
          onLoadSuccess={onDocumentLoadSuccess}>
          {Array.from(
            new Array(numPages),
            (el, index) => (
              <div>
                <Page
                  key={`page_${index + 1}`}
                  pageNumber={index + 1}
                  renderTextLayer={false}
                  scale={zoomLevel}
                  />
                <br/>
                </div>
              ),
              )}
        </Document>
          </div>
      </div>
      );
}

export default PdfDisplay