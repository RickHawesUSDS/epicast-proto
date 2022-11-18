import {
  ChonkyActions,
  ChonkyFileActionData,
  FileArray,
  FileBrowser,
  FileData,
  FileList,
  FileNavbar,
  FileToolbar,
  setChonkyDefaults,
} from 'chonky';
import { ChonkyIconFA } from 'chonky-icon-fontawesome';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { getFeed } from '../features/api/api'

setChonkyDefaults({ iconComponent: ChonkyIconFA })

export default function FeedBrowser (props) {
  const [error, setError] = useState(null);
  const [folderPrefix, setKeyPrefix] = useState('/');
  const [files, setFiles] = useState([]);

  useEffect(() => {
      getFeed(folderPrefix)
        .then(setFiles)
        .catch((error) => setError(error.message))
  }, [folderPrefix, setFiles]);

  const folderChain = useMemo(() => {
      let folderChain
      if (folderPrefix === '/') {
          folderChain = [];
      } else {
          let currentPrefix = '';
          folderChain = folderPrefix
              .replace(/\/*$/, '')
              .split('/')
              .map(
                  (prefixPart) => {
                      currentPrefix = currentPrefix
                          ? [currentPrefix, prefixPart].join('/')
                          : prefixPart;
                      return {
                          id: currentPrefix,
                          name: prefixPart,
                          isDir: true,
                      };
                  }
              );
      }
      folderChain.unshift({
          id: '/',
          name: 'EPICAST-DEMO-FEED',
          isDir: true,
      });
      return folderChain;
  }, [folderPrefix]);

  const handleFileAction = useCallback(
      (data) => {
          if (data.id === ChonkyActions.OpenFiles.id) {
              if (data.payload.files && data.payload.files.length !== 1) return;
              if (!data.payload.targetFile || !data.payload.targetFile.isDir) return;

              const newPrefix = `${data.payload.targetFile.id.replace(/\/*$/, '')}/`;
              console.log(`Key prefix: ${newPrefix}`);
              setKeyPrefix(newPrefix);
          }
      },
      [setKeyPrefix]
  );

  const fileActions = useMemo(
    () => [
        ChonkyActions.DownloadFiles, // Adds a button and a shortcut: Delete
    ],
    []
  );

  return (
      <div className="story-wrapper">
          <div style={{ height: 400 }}>
              <FileBrowser
                  instanceId='FeedBrowser'
                  files={files}
                  folderChain={folderChain}
                  onFileAction={handleFileAction}
                  defaultFileViewActionId={ChonkyActions.EnableListView.id}
                  fileActions={fileActions}
              >
                  <FileNavbar />
                  <FileToolbar />
                  <FileList />
              </FileBrowser>
          </div>
      </div>
  );
};
