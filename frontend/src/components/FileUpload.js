import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import '../styles/landing-page.css';
import { UploadCloudIcon } from '../static/Icons';

const uploadConfigByMode = {
  vocab: {
    acceptedFormatsLabel: '.db',
    title: 'Drop vocab.db file here or browse from your Kindle',
    buttonLabel: 'Choose file',
    accept: {
      'application/x-sqlite3': ['.db', '.sqlite', '.sqlite3'],
    },
    errorMessage: 'Please upload a valid vocab database file (.db, .sqlite, or .sqlite3).',
  },
  clippings: {
    acceptedFormatsLabel: '.txt',
    title: 'Drop My Clippings.txt file here or browse from your Kindle',
    buttonLabel: 'Choose file',
    accept: {
      'text/plain': ['.txt'],
    },
    errorMessage: 'Please upload a valid highlights text file (.txt).',
  },
};

const formatFileSize = (sizeInBytes) => {
  if (sizeInBytes < 1024) {
    return `${sizeInBytes} B`;
  }

  if (sizeInBytes < 1024 * 1024) {
    return `${(sizeInBytes / 1024).toFixed(1)} KB`;
  }

  return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
};

const FileUpload = ({ mode, selectedFile, onChange }) => {
  const [errorMessage, setErrorMessage] = useState('');

  const uploadConfig = useMemo(() => {
    return uploadConfigByMode[mode] ?? uploadConfigByMode.vocab;
  }, [mode]);

  useEffect(() => {
    setErrorMessage('');
  }, [mode]);

  const handleDropAccepted = useCallback((files) => {
    onChange?.(files[0] ?? null);
    setErrorMessage('');
  }, [onChange]);

  const handleDropRejected = useCallback(() => {
    onChange?.(null);
    setErrorMessage(uploadConfig.errorMessage);
  }, [onChange, uploadConfig.errorMessage]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: uploadConfig.accept,
    multiple: false,
    onDropAccepted: handleDropAccepted,
    onDropRejected: handleDropRejected,
  });

  const handleClear = (event) => {
    event.stopPropagation();
    onChange?.(null);
    setErrorMessage('');
  };

  return (
    <div
      {...getRootProps()}
      className={`upload-box${isDragActive ? ' drag-active' : ''}`}
    >
      <input {...getInputProps()} />
      <div className='upload-box-icon'>
        <UploadCloudIcon />
      </div>
      <div className='upload-box-title'>
        {isDragActive ? 'Drop file here' : uploadConfig.title}
      </div>
      <div className='upload-box-accepted'>Accepted file: {uploadConfig.acceptedFormatsLabel}</div>

      {!selectedFile ? (
        <button className='upload-box-button' type='button'>
          {uploadConfig.buttonLabel}
        </button>
      ) : (
        <>
          <div className='upload-box-file-summary'>
            <span className='upload-box-file-name'>{selectedFile.name}</span>
            <span className='upload-box-file-size'>{formatFileSize(selectedFile.size)}</span>
          </div>
          <div className='upload-box-actions'>
            <button
              className='upload-box-secondary-button'
              onClick={(event) => {
                event.stopPropagation();
                open();
              }}
              type='button'
            >
              Change file
            </button>
            <button className='upload-box-secondary-button' onClick={handleClear} type='button'>
              Clear
            </button>
          </div>
        </>
      )}

      {errorMessage ? <div className='upload-box-error'>{errorMessage}</div> : null}
    </div>
  );
};

export default FileUpload