import React, { useState } from 'react';

function FileUploader({ onFileUpload }) {
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileUpload(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            onFileUpload(e.target.files[0]);
        }
    };

    return (
        <div
            className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer
        ${dragActive ? 'border-pink-500 bg-pink-500/10' : 'border-purple-500/30'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
        >
            <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.mp4"
                onChange={handleChange}
                id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
                <div className="text-purple-200">
                    <p className="mb-2">Drag and drop your file here or click to select</p>
                    <p className="text-sm text-purple-300">Supports PDF, Images (JPG, PNG), and Video files</p>
                </div>
            </label>
        </div>
    );
}

export default FileUploader;