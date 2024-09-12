import React from 'react'


type loadingStatus = {
    status : string,
    fileName : string,
    totalPages : number
    pageTreated : number,
}

function LoadingBar({loadingInfos} : any) {
  return (
    <>
    {loadingInfos && loadingInfos.status === 'starting' && 
    <>
    <div>Loading is about to start</div>
    </>
    }
    {loadingInfos && loadingInfos.status === 'loading' && 
    <>
    <div>Currently loading : {loadingInfos.fileName}</div>
    <div>page {loadingInfos.pageTreated} / {loadingInfos.totalPages}</div>
    </>
    }
    {loadingInfos && loadingInfos.status === 'succeed' && 
    <>
    <div>All your docs are loaded</div>
    <div>{loadingInfos.totalFilesPages} pages pour {loadingInfos.totalFiles}</div>
    </>
    }
    {loadingInfos && loadingInfos.status === 'failed' && 
    <>
    <div>Something failed, try again later or contact the support</div>
    </>
    }

    </>
  )
}

export default LoadingBar