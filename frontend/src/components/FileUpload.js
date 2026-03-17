import {useDropzone} from 'react-dropzone';
import '../styles/landing-page.css';

const FileUpload = ({
  accept,
  buttonLabel,
  emptyTitle,
  emptySubtitle,
  activeTitle,
  activeSubtitle,
  acceptedFormatsLabel,
  iconLabel,
  variant = 'vocab',
  onFileSelect,
}) => {
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    acceptedFiles,
  } = useDropzone({
    accept,
    multiple: false,
    onDropAccepted: (files) => {
      onFileSelect?.(files[0] ?? null);
    },
  });
  const className = `file-upload-dropzone file-upload-dropzone-${variant} ${isDragActive ? 'active' : ''}`;
  const selectedFile = acceptedFiles[0];

  return (
    <div {...getRootProps()} className={className}>
      <input {...getInputProps()} />
      <div className={`file-upload-icon file-upload-icon-${variant}`}>{iconLabel}</div>
      <div className='file-upload-title'>
        {isDragActive ? activeTitle : emptyTitle}
      </div>
      <div className='file-upload-subtitle'>
        {isDragActive ? activeSubtitle : emptySubtitle}
      </div>
      <div className={`file-upload-button file-upload-button-${variant}`}>{buttonLabel}</div>
      <div className='file-upload-meta'>Accepted formats: {acceptedFormatsLabel}</div>
      {selectedFile ? (
        <div className='file-upload-selected'>Selected: {selectedFile.name}</div>
      ) : null}
    </div>
  )
}

export default FileUpload