import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navigation from './Navigation';
import { useNavigate } from 'react-router-dom';
import './UploadFiles.css'; // Assuming you have your custom styles here

function UploadFiles({ onDataLoaded }) {
    const [files, setFiles] = useState([]);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState(''); 
    const navigate = useNavigate();

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 4) {
            setError('You can only upload up to 4 files.');
            return;
        }

        setFiles(acceptedFiles);
        setError('');
    }, []);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: '.csv'
    });

    const handleFileUpload = async () => {
        if (files.length === 0) {
            setError('Please select files to upload.');
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccessMessage('');

        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        try {
            const response = await axios.post('http://localhost:5000/upload-csv', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log("Upload successful:", response.data);

            if (response.data.errors && response.data.errors.length > 0) {
                setValidationErrors(response.data.errors);
                setTimeout(() => {
                    navigate('/dashboard');
                }, 3000);
            } else {
                onDataLoaded(response.data);
                setFiles([]);
                setValidationErrors([]);
                setSuccessMessage('Files uploaded successfully! Redirecting to dashboard...');
                setTimeout(() => {
                    navigate('/dashboard');
                }, 3000);
            }
        } catch (error) {
            console.error("Error during file upload", error);
            setError(`Error uploading files: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Navigation/>
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="cardUp">
                    <div className="card-bodyUp">
                        <h2 className="card-titleUp mb-4 text-center">Upload CSV Files</h2>
                        <div 
                            {...getRootProps({ className: 'dropzone' })}
                        >
                            <input {...getInputProps()} />
                            <p>Drag & drop some files here, or click to select files</p>
                        </div>
                        <button 
                            onClick={handleFileUpload}
                            className="btn btn-dark btn-block mt-3"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Uploading...' : 'Upload Files'}
                        </button>
                        {files.length > 0 && (
                            <div className="mt-4">
                                <h5>Selected Files:</h5>
                                <ul className="list-group">
                                    {files.map((file, index) => (
                                        <li key={index} className="list-group-item">{file.name}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {error && <div className="alert alert-danger mt-3" role="alert">{error}</div>}
                        {validationErrors.length > 0 && (
                            <div className="alert alert-warning mt-3" role="alert">
                                <h5>Validation Errors:</h5>
                                <ul>
                                    {validationErrors.map((err, index) => (
                                        <li key={index}>{err}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {successMessage && (
                            <div className="alert alert-success mt-3" role="alert">{successMessage}</div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default UploadFiles;
